"""Validation automatique du catalogue (tests de contenu du §H7).

Usage : python3 outils/valider.py [--rapport chemin.md]
Code de sortie 0 si aucune erreur (les avertissements n'échouent pas).

Ce script est un outil de préproduction : il ne prouve pas l'équilibrage, seulement la
cohérence structurelle (identifiants, références, accessibilité, cycles, plafonds).
"""
from __future__ import annotations

import argparse
import collections
import sys

from commun import (AFFINITES, APTITUDES, CIBLAGES, CIBLES, FAMILLES, ID_RE, LIVRAISONS,
                    PREFIXES, STATUTS, TAGS_EFFET, acces_satisfait, charger, index,
                    jetons_acces)


class Rapport:
    def __init__(self) -> None:
        self.erreurs: list[str] = []
        self.avert: list[str] = []
        self.infos: list[str] = []

    def err(self, m: str) -> None:
        self.erreurs.append(m)

    def warn(self, m: str) -> None:
        self.avert.append(m)

    def info(self, m: str) -> None:
        self.infos.append(m)


def verifier_ids(cat, r: Rapport) -> None:
    vus: dict[str, str] = {}
    for cle, entrees in cat.items():
        pref = PREFIXES[cle]
        for e in entrees:
            i = e.get("id")
            if not i or not ID_RE.match(i) or not i.startswith(pref + "_"):
                r.err(f"[{cle}] identifiant invalide : {i!r} ({e.get('_fichier')})")
                continue
            if i in vus:
                r.err(f"[{cle}] doublon d'identifiant {i} ({vus[i]} / {e.get('_fichier')})")
            vus[i] = e.get("_fichier")
        mini, maxi = CIBLES.get(cle, (None, None))
        n = len(entrees)
        if mini is not None and n < mini:
            r.warn(f"[{cle}] {n} entrées, cible {mini} (incomplet)")
        if maxi is not None and n > maxi:
            r.err(f"[{cle}] {n} entrées, maximum {maxi}")
        r.info(f"{cle} : {n}")


def verifier_acces_tokens(expr, idx, ou: str, r: Rapport) -> None:
    for j in jetons_acces(expr):
        if j == "LIBRE" or j in APTITUDES:
            continue
        if j.startswith("CHR_") and j in idx:
            continue
        r.err(f"{ou} : jeton d'accès inconnu {j!r}")


def verifier_techniques(cat, idx, r: Rapport) -> None:
    persos = cat["personnages"]
    compte = collections.Counter()
    for t in cat["techniques"]:
        num = int(t["id"][4:])
        fam = t.get("famille")
        compte[fam] += 1
        if fam not in FAMILLES:
            r.err(f"{t['id']} famille inconnue {fam}")
        else:
            a, b = FAMILLES[fam]
            if not a <= num <= b:
                r.err(f"{t['id']} hors de la plage {a}-{b} de la famille {fam}")
        if t.get("livraison") not in LIVRAISONS:
            r.err(f"{t['id']} livraison inconnue {t.get('livraison')}")
        if t.get("statut") not in STATUTS:
            r.err(f"{t['id']} statut inconnu {t.get('statut')}")
        if t.get("cible") not in CIBLAGES:
            r.err(f"{t['id']} ciblage inconnu {t.get('cible')}")
        tags = t.get("tags", [])
        aff = [x for x in tags if x.startswith("E_")]
        if not aff:
            r.err(f"{t['id']} sans tag d'affinité")
        for x in tags:
            if x not in AFFINITES and x not in TAGS_EFFET:
                r.err(f"{t['id']} tag hors nomenclature {x}")
        if t.get("livraison") == "INVOCATION" and "UNITE_ALLIEE" not in tags:
            r.err(f"{t['id']} INVOCATION sans UNITE_ALLIEE")
        for champ in ("nom", "comportement", "valeurs", "visuel", "acces"):
            if not t.get(champ):
                r.err(f"{t['id']} champ manquant {champ}")
        verifier_acces_tokens(t.get("acces"), idx, t["id"], r)
        if persos and not any(acces_satisfait(t["acces"], p) for p in persos):
            r.err(f"{t['id']} inaccessible à tous les personnages (mode principal)")
    for fam, (a, b) in FAMILLES.items():
        if compte[fam] != b - a + 1:
            r.err(f"famille {fam} : {compte[fam]} techniques, attendu {b - a + 1}")


def pool_personnage(p, cat) -> list[str]:
    return [t["id"] for t in cat["techniques"] if acces_satisfait(t["acces"], p)]


def verifier_personnages(cat, idx, r: Rapport) -> None:
    bases = 0
    for p in cat["personnages"]:
        pid = p["id"]
        if p.get("type") == "BASE":
            bases += 1
        elif p.get("type") == "VARIANTE":
            b = idx.get(p.get("base"))
            if not b or b.get("type") != "BASE":
                r.err(f"{pid} variante sans base valide")
        else:
            r.err(f"{pid} type inconnu")
        for a in p.get("aptitudes", []):
            if a not in APTITUDES:
                r.err(f"{pid} aptitude inconnue {a}")
        dep = idx.get(p.get("depart"))
        if not dep:
            r.err(f"{pid} technique de départ inexistante {p.get('depart')}")
        elif not acces_satisfait(dep["acces"], p):
            r.err(f"{pid} ne peut pas accéder à sa technique de départ {dep['id']}")
        u = idx.get(p.get("ultime"))
        if not u:
            r.err(f"{pid} ultime inexistant {p.get('ultime')}")
        elif pid not in u.get("utilisateurs", []):
            r.err(f"{pid} absent des utilisateurs de {u['id']}")
        for tr in p.get("transformations", []):
            t = idx.get(tr)
            if not t:
                r.err(f"{pid} transformation inexistante {tr}")
            elif pid not in t.get("acces", []):
                r.err(f"{pid} absent de l'accès de {tr}")
        if len(p.get("orientations", [])) < 2:
            r.err(f"{pid} moins de deux orientations de build")
        taille = len(pool_personnage(p, cat))
        if taille < 18:
            r.warn(f"{pid} pool de techniques admissibles faible : {taille} (< 18)")
        dbl = p.get("deblocage", {})
        if dbl.get("type") in ("MISSION", "MAITRISE"):
            if cat["missions"] and dbl.get("ref") not in idx:
                r.err(f"{pid} mission de déblocage inexistante {dbl.get('ref')}")
    if bases < 40:
        r.err(f"{bases} personnages distincts (< 40)")
    r.info(f"personnages distincts : {bases}")
    # réciprocité ultimes / transformations
    for u in cat["ultimes"]:
        for c in u.get("utilisateurs", []):
            p = idx.get(c)
            if not p or p.get("ultime") != u["id"]:
                r.err(f"{u['id']} liste {c} qui ne l'utilise pas")
    for t in cat["transformations"]:
        if not t.get("acces"):
            r.err(f"{t['id']} sans accès")
        for c in t.get("acces", []):
            p = idx.get(c)
            if not p or t["id"] not in p.get("transformations", []):
                r.err(f"{t['id']} liste {c} qui ne la possède pas")
        for champ in ("silhouette", "aura", "son", "regle", "cout", "fin"):
            if not t.get(champ):
                r.err(f"{t['id']} champ obligatoire manquant {champ}")


def personnages_pour_recette(evo, idx, cat, profondeur=0) -> list[dict]:
    """Personnages capables de réaliser la recette (sources, catalyseurs, condition)."""
    if profondeur > 3:
        return []
    candidats = []
    for p in cat["personnages"]:
        ok = True
        for s in evo.get("sources", []):
            src = idx.get(s)
            if not src:
                ok = False
            elif s.startswith("JUT_"):
                ok = ok and acces_satisfait(src["acces"], p)
            elif s.startswith("EVO_"):
                ok = ok and p["id"] in {c["id"] for c in personnages_pour_recette(src, idx, cat, profondeur + 1)}
        for c in evo.get("catalyseurs", []):
            cc = idx.get(c)
            ok = ok and cc is not None and acces_satisfait(cc.get("acces", "LIBRE"), p)
        cond = evo.get("condition_tardive")
        if cond:
            alts = cond.split("|")
            sat = False
            for a in alts:
                if a.startswith("TRF_") and a in p.get("transformations", []):
                    sat = True
                if a.startswith("EQP_") and a in idx:
                    sat = True
            ok = ok and sat
        if ok:
            candidats.append(p)
    return candidats


def verifier_evolutions(cat, idx, r: Rapport) -> None:
    types = collections.Counter()
    for e in cat["evolutions"]:
        eid, ty = e["id"], e.get("type")
        types[ty] += 1
        srcs = e.get("sources", [])
        for s in srcs:
            if s not in idx:
                r.err(f"{eid} source inexistante {s}")
        for c in e.get("catalyseurs", []):
            if c not in idx or not (c.startswith("PAS_") or c.startswith("EQP_")):
                r.err(f"{eid} catalyseur invalide {c}")
        if ty == "EVOLUTION":
            if len(srcs) != 1 or not srcs[0].startswith("JUT_"):
                r.err(f"{eid} EVOLUTION doit avoir 1 source JUT")
            if not e.get("catalyseurs"):
                r.err(f"{eid} EVOLUTION sans catalyseur")
        elif ty == "FUSION":
            if len(srcs) != 2 or not all(s.startswith("JUT_") for s in srcs):
                r.err(f"{eid} FUSION doit avoir 2 sources JUT")
            if len(set(srcs)) != 2:
                r.err(f"{eid} FUSION avec sources identiques")
        elif ty == "EVEIL":
            if len(srcs) != 1 or not srcs[0].startswith("EVO_"):
                r.err(f"{eid} EVEIL doit avoir 1 source EVO")
            else:
                src = idx.get(srcs[0], {})
                if src.get("type") == "EVEIL":
                    r.err(f"{eid} profondeur > 2 (éveil d'un éveil)")
            if not e.get("condition_tardive"):
                r.err(f"{eid} EVEIL sans condition tardive")
        else:
            r.err(f"{eid} type inconnu {ty}")
        if not personnages_pour_recette(e, idx, cat):
            r.err(f"{eid} recette réalisable par aucun personnage (sources/catalyseurs/condition)")
    # cycles (graphe sources -> résultat)
    graphe = {e["id"]: [s for s in e.get("sources", []) if s.startswith("EVO_")] for e in cat["evolutions"]}
    etat: dict[str, int] = {}

    def dfs(n):
        etat[n] = 1
        for m in graphe.get(n, []):
            if etat.get(m) == 1:
                r.err(f"cycle de recettes impliquant {n} -> {m}")
            elif etat.get(m) is None:
                dfs(m)
        etat[n] = 2

    for n in graphe:
        if n not in etat:
            dfs(n)
    # une technique n'a qu'une évolution de type EVOLUTION (les embranchements passent par la fusion)
    par_source = collections.defaultdict(list)
    for e in cat["evolutions"]:
        if e.get("type") == "EVOLUTION":
            par_source[e["sources"][0]].append(e["id"])
    for s, lst in par_source.items():
        if len(lst) > 1:
            r.err(f"{s} a plusieurs évolutions simples {lst}")
    r.info("recettes : " + ", ".join(f"{k}={v}" for k, v in sorted(types.items())))


def verifier_passifs_equipements(cat, idx, r: Rapport) -> None:
    for p in cat["passifs"]:
        verifier_acces_tokens(p.get("acces"), idx, p["id"], r)
    rar = collections.Counter()
    for q in cat["equipements"]:
        verifier_acces_tokens(q.get("acces"), idx, q["id"], r)
        rar[q.get("rarete")] += 1
        if q.get("rarete") == "Interdit" and q.get("contrainte", "—") in ("", "—"):
            r.err(f"{q['id']} objet interdit sans contrainte annoncée")
    r.info("équipements par rareté : " + ", ".join(f"{k}={v}" for k, v in sorted(rar.items())))


def verifier_synergies(cat, idx, r: Rapport) -> None:
    for s in cat["synergies"]:
        for ref in s.get("references", []):
            if ref not in idx and ref not in AFFINITES and ref not in TAGS_EFFET and not ref.startswith("STA_") \
                    and not ref.startswith("SURF_") and ref not in LIVRAISONS and ref not in FAMILLES \
                    and ref not in APTITUDES:
                r.err(f"{s['id']} référence inconnue {ref}")
        for champ in ("condition", "effet", "limite", "manifestation"):
            if not s.get(champ):
                r.err(f"{s['id']} champ manquant {champ}")


def verifier_builds(cat, idx, r: Rapport) -> None:
    prioritaires = {p["id"] for p in cat["personnages"] if p.get("prioritaire")}
    couverts = set()
    for b in cat["builds"]:
        bid = b["id"]
        p = idx.get(b.get("personnage"))
        if not p:
            r.err(f"{bid} personnage inexistant")
            continue
        couverts.add(p["id"])
        tech = b.get("techniques", [])
        pas = b.get("passifs", [])
        eqp = b.get("equipements", [])
        if len(tech) > 6 or len(pas) > 6 or len(eqp) > 2:
            r.err(f"{bid} dépasse les emplacements ({len(tech)}/{len(pas)}/{len(eqp)})")
        if tech and tech[0] != p.get("depart"):
            r.err(f"{bid} la première technique doit être la signature {p.get('depart')}")
        for t in tech:
            tt = idx.get(t)
            if not tt:
                r.err(f"{bid} technique inexistante {t}")
            elif not acces_satisfait(tt["acces"], p):
                r.err(f"{bid} technique {t} inaccessible à {p['id']}")
        for x in pas + eqp:
            xx = idx.get(x)
            if not xx:
                r.err(f"{bid} composant inexistant {x}")
            elif not acces_satisfait(xx.get("acces", "LIBRE"), p):
                r.err(f"{bid} composant {x} inaccessible à {p['id']}")
        for ev in b.get("evolutions", []):
            e = idx.get(ev)
            if not e:
                r.err(f"{bid} évolution inexistante {ev}")
                continue
            base_srcs = e["sources"] if e["type"] != "EVEIL" else idx[e["sources"][0]]["sources"]
            for s in base_srcs:
                if s not in tech:
                    r.err(f"{bid} {ev} exige {s} absent des techniques du build")
            cats = e.get("catalyseurs", []) + (idx[e["sources"][0]].get("catalyseurs", []) if e["type"] == "EVEIL" else [])
            for c in cats:
                if c not in pas and c not in eqp:
                    r.err(f"{bid} {ev} exige le catalyseur {c} absent du build")
            cond = e.get("condition_tardive")
            if cond and not any(a in (b.get("transformation"),) or a in eqp for a in cond.split("|")):
                r.err(f"{bid} {ev} condition tardive {cond} non satisfaite par le build")
            if p["id"] not in {c["id"] for c in personnages_pour_recette(e, idx, cat)}:
                r.err(f"{bid} {ev} non réalisable par {p['id']}")
        tr = b.get("transformation")
        if tr and tr not in p.get("transformations", []):
            r.err(f"{bid} transformation {tr} non accessible à {p['id']}")
        if len(b.get("remplacements", [])) < 2:
            r.err(f"{bid} moins de deux remplacements")
    manquants = prioritaires - couverts
    if cat["builds"] and manquants:
        r.err(f"personnages prioritaires sans build : {sorted(manquants)}")


def verifier_missions_deblocages(cat, idx, r: Rapport) -> None:
    missions = cat["missions"]
    if not missions:
        return
    debloque_par: dict[str, list[str]] = collections.defaultdict(list)
    for m in missions:
        for d in m.get("recompenses", {}).get("deblocages", []):
            if d not in idx:
                r.err(f"{m['id']} déblocage inexistant {d}")
            debloque_par[d].append(m["id"])
        for dep in m.get("dependances", []):
            if dep not in idx:
                r.err(f"{m['id']} dépendance inexistante {dep}")
        if m.get("carte") and m["carte"] not in idx:
            r.err(f"{m['id']} carte inexistante {m['carte']}")
        req = m.get("personnage")
        if req and req not in ("TOUS",) and req not in idx:
            r.err(f"{m['id']} personnage requis inexistant {req}")
        if req and req in m.get("recompenses", {}).get("deblocages", []):
            r.err(f"{m['id']} exige de posséder {req} qu'elle débloque")
    # chaque personnage non initial : exactement une source de déblocage cohérente
    for p in cat["personnages"]:
        dbl = p.get("deblocage", {})
        if dbl.get("type") in ("MISSION", "MAITRISE"):
            ref = dbl.get("ref")
            if ref not in debloque_par.get(p["id"], []):
                r.err(f"{p['id']} : la mission {ref} ne le débloque pas dans ses récompenses")
    # simulation de déblocage (ordre topologique) : aucun cycle, tout est atteignable
    possedes = {p["id"] for p in cat["personnages"] if p.get("deblocage", {}).get("type") in ("DEPART", "PREMIERE_RUN")}
    faites: set[str] = set()
    progres = True
    while progres:
        progres = False
        for m in missions:
            if m["id"] in faites:
                continue
            req = m.get("personnage")
            deps_ok = all(d in faites or d in possedes or not d.startswith("MIS_") for d in m.get("dependances", []))
            if req in (None, "TOUS") or req in possedes:
                if deps_ok:
                    faites.add(m["id"])
                    possedes |= set(m.get("recompenses", {}).get("deblocages", []))
                    progres = True
    inatteignables = [m["id"] for m in missions if m["id"] not in faites]
    if inatteignables:
        r.err(f"missions inatteignables (cycle ou dépendance manquante) : {inatteignables[:12]}{'…' if len(inatteignables) > 12 else ''}")
    persos_non = [p["id"] for p in cat["personnages"] if p["id"] not in possedes]
    if persos_non:
        r.err(f"personnages jamais débloquables : {persos_non}")
    r.info(f"missions atteignables : {len(faites)}/{len(missions)}")


def verifier_cartes_boss_ennemis(cat, idx, r: Rapport) -> None:
    for c in cat["cartes"]:
        for ref in [c.get("boss")] + c.get("ennemis", []) + c.get("boss_secondaires", []):
            if ref and ref not in idx:
                r.err(f"{c['id']} référence inexistante {ref}")
    for b in cat["boss"]:
        if b.get("carte") and b["carte"] not in idx:
            r.err(f"{b['id']} carte inexistante {b['carte']}")
    elites = [e for e in cat["ennemis"] if e.get("elite")]
    for e in cat["ennemis"]:
        n = int(e["id"][4:])
        if bool(e.get("elite")) != (76 <= n <= 100):
            r.err(f"{e['id']} : les élites doivent occuper ENM_076-100")
    if cat["ennemis"] and len(elites) != 25:
        r.err(f"{len(elites)} élites (attendu 25)")
    for s in cat["secrets"]:
        for ref in s.get("references", []):
            if ref not in idx:
                r.err(f"{s['id']} référence inexistante {ref}")


def verifier_valeurs(cat, r: Rapport) -> None:
    for p in cat["personnages"]:
        st = p.get("stats", {})
        if st.get("pv", 1) <= 0 or st.get("depl", 1) <= 0:
            r.err(f"{p['id']} valeur négative ou nulle")


def verifier_probabilites(r: Rapport) -> None:
    """Rejoue l'exemple §B6.4 et vérifie que la somme vaut 100 %."""
    cats = {"A": 0.40, "B": 0.30, "C": 0.15, "D": 0.15}
    poids_a = {"JUT_217": 120, "JUT_281": 100, "JUT_185": 100}
    total_a = sum(poids_a.values())
    probs = {k: cats["A"] * v / total_a for k, v in poids_a.items()}
    probs["B*"], probs["C*"], probs["D*"] = cats["B"], cats["C"], cats["D"]
    s = sum(probs.values())
    if abs(s - 1.0) > 1e-9:
        r.err(f"exemple de probabilités : somme {s:.6f} ≠ 1")
    # renormalisation catégories vides (B et D vides)
    reste = {k: v for k, v in cats.items() if k in ("A", "C")}
    tot = sum(reste.values())
    if abs(sum(v / tot for v in reste.values()) - 1.0) > 1e-9:
        r.err("renormalisation incorrecte")
    r.info("exemple de probabilités §B6.4 : " + ", ".join(f"{k}={v * 100:.2f}%" for k, v in probs.items()))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rapport")
    args = ap.parse_args()
    cat = charger()
    idx = index(cat)
    r = Rapport()
    verifier_ids(cat, r)
    verifier_techniques(cat, idx, r)
    verifier_personnages(cat, idx, r)
    verifier_evolutions(cat, idx, r)
    verifier_passifs_equipements(cat, idx, r)
    verifier_synergies(cat, idx, r)
    verifier_builds(cat, idx, r)
    verifier_missions_deblocages(cat, idx, r)
    verifier_cartes_boss_ennemis(cat, idx, r)
    verifier_valeurs(cat, r)
    verifier_probabilites(r)
    lignes = ["# Rapport de validation", "", f"Erreurs : {len(r.erreurs)} — Avertissements : {len(r.avert)}", ""]
    lignes += ["## Comptes", ""] + [f"- {x}" for x in r.infos] + [""]
    lignes += ["## Erreurs", ""] + ([f"- {x}" for x in r.erreurs] or ["- aucune"]) + [""]
    lignes += ["## Avertissements", ""] + ([f"- {x}" for x in r.avert] or ["- aucun"]) + [""]
    texte = "\n".join(lignes)
    print(texte)
    if args.rapport:
        with open(args.rapport, "w", encoding="utf-8") as f:
            f.write(texte)
    return 1 if r.erreurs else 0


if __name__ == "__main__":
    sys.exit(main())
