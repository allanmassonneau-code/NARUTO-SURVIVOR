"""Génère les catalogues lisibles (Markdown) et les exports (CSV, JSON) depuis data/*.yaml.

Usage : python3 outils/generer.py
Sorties : dossier/E_catalogues/*.md, catalogues/*.csv, catalogues/*.json
Les fichiers générés portent un en-tête « ne pas modifier à la main » : la source est data/.
"""
from __future__ import annotations

import collections
import csv
import json
import os

from commun import FAMILLES, RACINE, charger, index

SORTIE_MD = os.path.join(RACINE, "dossier", "E_catalogues")
SORTIE_EXPORT = os.path.join(RACINE, "catalogues")
ENTETE = "<!-- Fichier généré par outils/generer.py depuis data/ — ne pas modifier à la main. -->\n\n"

NOMS_FAMILLES = {
    "KATON": "Katon", "SUITON": "Suiton", "RAITON": "Raiton", "FUTON": "Fūton", "DOTON": "Doton",
    "RARE": "Affinités rares", "TAIJUTSU": "Taijutsu", "OUTIL": "Armes et outils ninja",
    "INVOC": "Invocations et clones", "GENJUTSU": "Genjutsu", "SCEAU": "Sceaux", "CLAN": "Clan et héritage",
    "OCULAIRE": "Techniques oculaires",
}
STATUT = {"OA": "œuvre adaptée", "CO": "création originale", "AV": "attribution à vérifier"}


def cell(x) -> str:
    if x is None:
        return "—"
    if isinstance(x, list):
        x = ", ".join(str(i) for i in x) if x else "—"
    return str(x).replace("|", "\\|").replace("\n", " ")


def table(entetes, lignes) -> str:
    out = ["| " + " | ".join(entetes) + " |", "|" + "|".join("---" for _ in entetes) + "|"]
    for l in lignes:
        out.append("| " + " | ".join(cell(c) for c in l) + " |")
    return "\n".join(out) + "\n"


def ecrire(nom, texte):
    with open(os.path.join(SORTIE_MD, nom), "w", encoding="utf-8") as f:
        f.write(ENTETE + texte)


def exporter(cle, entrees):
    propres = [{k: v for k, v in e.items() if not k.startswith("_")} for e in entrees]
    with open(os.path.join(SORTIE_EXPORT, f"{cle}.json"), "w", encoding="utf-8") as f:
        json.dump(propres, f, ensure_ascii=False, indent=1)
    cles = []
    for e in propres:
        for k in e:
            if k not in cles:
                cles.append(k)
    with open(os.path.join(SORTIE_EXPORT, f"{cle}.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(cles)
        for e in propres:
            w.writerow([json.dumps(e[k], ensure_ascii=False) if isinstance(e.get(k), (list, dict)) else e.get(k, "") for k in cles])


def main() -> None:
    os.makedirs(SORTIE_MD, exist_ok=True)
    os.makedirs(SORTIE_EXPORT, exist_ok=True)
    cat = charger()
    idx = index(cat)
    for cle, entrees in cat.items():
        exporter(cle, entrees)

    # liens technique -> recettes
    liens = collections.defaultdict(list)
    for e in cat["evolutions"]:
        for s in e["sources"]:
            liens[s].append(f"{e['id']} ({e['type'].lower()})")
    utilisateurs = collections.defaultdict(list)

    # --- Techniques (une page par famille) ---
    sommaire = []
    for fam, (a, b) in FAMILLES.items():
        lignes = []
        for t in cat["techniques"]:
            if t["famille"] != fam:
                continue
            lignes.append([
                t["id"],
                f"**{t['nom']}** — {STATUT[t['statut']]}",
                f"{NOMS_FAMILLES[fam]} ; livraison {t['livraison']} ; " + ", ".join(t["tags"]),
                f"{t['comportement']} Cible : {t['cible']}.",
                t["valeurs"],
                t["visuel"],
                f"Accès : `{t['acces']}`. {t.get('limites', '')}",
                liens.get(t["id"], []),
            ])
        nom = f"techniques_{a:03d}_{b:03d}_{fam.lower()}.md"
        sommaire.append((NOMS_FAMILLES[fam], nom, len(lignes)))
        ecrire(nom, f"# Techniques — {NOMS_FAMILLES[fam]} (JUT_{a:03d} à JUT_{b:03d}) — {len(lignes)} entrées\n\n"
               + table(["ID", "Nom et statut", "Famille et tags", "Comportement et cible", "Valeurs initiales (niv. 1)",
                        "Identité visuelle", "Accès et limites", "Évolutions liées"], lignes))

    # --- Évolutions / fusions / éveils ---
    lignes = []
    for e in cat["evolutions"]:
        srcs = [f"{s} {idx[s]['nom']}" for s in e["sources"]]
        conso = {"EVOLUTION": "Remplace la source ; catalyseur conservé",
                 "FUSION": "Consomme les 2 sources ; libère 1 emplacement ; non améliorable",
                 "EVEIL": "Remplace l'évolution source ; aucune consommation"}[e["type"]]
        cond = "Source(s) niv. 8 + catalyseur(s) équipé(s)" if e["type"] != "EVEIL" else \
            f"Évolution source + temps ≥ 15:00 + {e.get('condition_tardive')}"
        lignes.append([e["id"], f"**{e['nom']}** ({e['type'].lower()}, {STATUT[e['statut']]})", srcs,
                       e.get("catalyseurs") or "—", cond, conso, f"{e['comportement']} Valeurs : {e['valeurs']}",
                       e["limites"], e["visuel"]])
    types = collections.Counter(e["type"] for e in cat["evolutions"])
    ecrire("evolutions.md", f"# Évolutions, fusions et éveils — {len(lignes)} recettes ({types['EVOLUTION']} évolutions, "
           f"{types['FUSION']} fusions, {types['EVEIL']} éveils)\n\nObtention : coffre (prioritaire dès que la recette est admissible). "
           "Règles : §B7. Accessibilité vérifiée par `outils/valider.py`.\n\n"
           + table(["ID", "Nom", "Sources", "Catalyseurs", "Conditions", "Consommation des emplacements",
                    "Nouveau comportement", "Limites", "Transformation visuelle"], lignes))

    # --- Synergies ---
    lignes = [[s["id"], f"**{s['nom']}**", s.get("references"), s["condition"], s["effet"],
               f"{s['limite']} Plafond : {s.get('plafond', '—')}", s["compatibilite"],
               f"{s['manifestation']} Contrepartie : {s.get('contrepartie', '—')}. Boss isolé : {s.get('boss_isole', '—')}"]
              for s in cat["synergies"]]
    ecrire("synergies.md", f"# Synergies — {len(lignes)} entrées\n\nToutes les synergies sont des règles de jeu (création originale). "
           "Règles communes : §B8.2.\n\n" + table(["ID", "Nom", "Sources", "Déclenchement", "Formule / effet", "Limite et plafond",
                                                   "Compatibilité", "Manifestation perceptible"], lignes))

    # --- Personnages ---
    lignes = []
    for p in cat["personnages"]:
        lignes.append([p["id"], f"**{p['nom']}**" + (f" (variante de {p['base']})" if p.get("type") == "VARIANTE" else "")
                       + (" ★" if p.get("prioritaire") else ""),
                       p["identite"], f"{p['depart']} {idx[p['depart']]['nom']}",
                       f"PV {p['stats']['pv']} ; {p['stats']['depl']} m/s ; {p['stats'].get('notes', '')}",
                       f"**{p['cpx']['nom']}** : {p['cpx']['effet']}", p["faiblesse"], p["signature"],
                       ", ".join(p["aptitudes"]), f"{p['ultime']} {idx[p['ultime']]['nom']}",
                       p.get("transformations") or "— (Maîtrise de l'ultime)",
                       f"{p['deblocage']['type']}" + (f" {p['deblocage'].get('ref')}" if p['deblocage'].get('ref') else ""),
                       p["orientations"]])
    nb_base = sum(1 for p in cat["personnages"] if p["type"] == "BASE")
    ecrire("personnages.md", f"# Roster — {len(lignes)} entrées jouables ({nb_base} personnages distincts, "
           f"{len(lignes) - nb_base} variantes)\n\n★ = personnage prioritaire (fiche approfondie dans `fiches_personnages.md`).\n\n"
           + table(["ID", "Entrée", "Identité de gameplay", "Technique de départ", "Statistiques", "Passif exclusif",
                    "Faiblesse", "Mécanique signature", "Compatibilités", "Ultime", "Transformation(s)", "Déblocage",
                    "Orientations de build"], lignes))

    # --- Passifs, équipements, transformations, ultimes ---
    cat_de = collections.defaultdict(list)
    for e in cat["evolutions"]:
        for c in e.get("catalyseurs", []):
            cat_de[c].append(e["id"])
    ecrire("passifs.md", f"# Passifs — {len(cat['passifs'])} entrées (niveau max 5)\n\n" + table(
        ["ID", "Nom", "Statistique", "Effet par niveau", "S'applique à", "Accès", "Catalyseur de"],
        [[p["id"], f"**{p['nom']}**", p["stat"], p["par_niveau"], p["applique_a"], f"`{p['acces']}`", cat_de.get(p["id"], [])]
         for p in cat["passifs"]]))
    ecrire("equipements.md", f"# Équipements — {len(cat['equipements'])} entrées\n\n" + table(
        ["ID", "Nom", "Rareté", "Rôle", "Effet", "Contrainte", "Accès", "Catalyseur de"],
        [[q["id"], f"**{q['nom']}** ({STATUT[q['statut']]})", q["rarete"], q["role"], q["effet"], q["contrainte"],
          f"`{q['acces']}`", cat_de.get(q["id"], [])] for q in cat["equipements"]]))
    ecrire("transformations.md", f"# Transformations — {len(cat['transformations'])} entrées\n\n" + table(
        ["ID", "Nom", "Accès", "Obtention", "Durée / recharge", "Coût", "Déclenchement auto", "Statistiques",
         "Nouveaux comportements", "Limites", "Fin", "Silhouette / aura / son", "Règle de combat"],
        [[t["id"], f"**{t['nom']}**", t["acces"], t["obtention"], f"{t['duree']} / {t['recharge']}", t["cout"], t["auto"],
          t["stats"], t["comportements"], t["limites"], t["fin"], f"{t['silhouette']} / {t['aura']} / {t['son']}", t["regle"]]
         for t in cat["transformations"]]))
    ecrire("ultimes.md", f"# Ultimes — {len(cat['ultimes'])} entrées\n\nCoût : 100 chakra. Règles : §B4.8.\n\n" + table(
        ["ID", "Nom", "Utilisateurs", "Déclenchement auto", "Effet", "Valeurs", "À vide (manuel)", "Maîtrise de l'ultime", "Visuel"],
        [[u["id"], f"**{u['nom']}** ({STATUT[u['statut']]})", u["utilisateurs"], u["auto"], u["effet"], u["valeurs"],
          u["a_vide"], u["maitrise"], u["visuel"]] for u in cat["ultimes"]]))

    # --- Cartes, boss, ennemis ---
    ecrire("cartes.md", f"# Cartes — {len(cat['cartes'])} entrées\n\nFiches intégrales : MAP_001, MAP_002, MAP_006, MAP_012 (D_contenu.md).\n\n" + table(
        ["ID", "Nom", "Tracé et taille", "Palette", "Obstacles", "Ressources", "Ennemis", "Événement signature", "Boss",
         "Secret", "Contrainte de déplacement"],
        [[c["id"], f"**{c['nom']}**", f"{c['trace']} ({c['taille']})", c["palette"], c["obstacles"], c["ressources"],
          c["ennemis"], c["evenement"], [c["boss"]] + c.get("boss_secondaires", []), c["secret"], c["contrainte"]]
         for c in cat["cartes"]]))
    lignes_b = []
    for b in cat["boss"]:
        attaques = "; ".join(f"{a['nom']} ({a['zone']}, avert. {a['avertissement']} s, {a['degats']} dég., {a['info']})"
                             for a in b.get("attaques", [])) or b.get("mecanique", "—")
        lignes_b.append([b["id"], f"**{b['nom']}**", b["niveau_detail"], b["cartes"], b.get("role_carte"), b["pv"],
                         b["silhouette"], b["hitbox"], b.get("deplacement"), attaques, b["conclusion"]])
    ecrire("boss.md", f"# Boss — {len(cat['boss'])} entrées\n\nPV au rang C. Fiches intégrales (attaques complètes) dans `D_contenu.md` §D4 et `data/boss_*.yaml`.\n\n"
           + table(["ID", "Nom", "Détail", "Cartes", "Rôle", "PV", "Silhouette", "Collision", "Déplacement", "Attaques / mécanique", "Conclusion"], lignes_b))
    ecrire("ennemis.md", f"# Archétypes ennemis — {len(cat['ennemis'])} entrées (dont {sum(1 for e in cat['ennemis'] if e.get('elite'))} élites)\n\n"
           "Valeurs à 00:00 au rang C ; mise à l'échelle §D5.\n\n" + table(
        ["ID", "Nom", "Rôle", "Élite (modificateur)", "Cartes", "PV", "Vitesse", "Dégâts", "XP", "Comportement", "Annonce visuelle du rôle"],
        [[e["id"], f"**{e['nom']}**", e["role"], e.get("modificateur", "—"), e["cartes"], e["pv"], e["vitesse"], e["degats"], e["xp"],
          e["comportement"], e["annonce"]] for e in cat["ennemis"]]))

    # --- Missions, secrets, builds ---
    ecrire("missions.md", f"# Missions — {len(cat['missions'])} entrées\n\nToutes atteignables (vérifié par simulation de déblocage dans `outils/valider.py`).\n\n" + table(
        ["ID", "Nom", "Type / mode", "Carte", "Entrée requise", "Rang", "Condition", "Récompenses", "Dépendances"],
        [[m["id"], f"**{m['nom']}**", f"{m['type']} / {m['mode']}", m["carte"], m["personnage"], m["rang"], m["condition"],
          f"{m['recompenses']['ryo']} Ryō ; " + (", ".join(m['recompenses']['deblocages']) or "—") + f" ; {m['recompenses']['autres']}",
          m["dependances"]] for m in cat["missions"]]))
    ecrire("secrets.md", f"# Secrets — {len(cat['secrets'])} entrées\n\n" + table(
        ["ID", "Nom", "Type", "Carte", "Condition", "Indices progressifs", "Récompense", "Dépendances"],
        [[s["id"], f"**{s['nom']}**", s["type"], s.get("carte"), s["condition"], " / ".join(s["indices"]), s["recompense"],
          s["dependances"]] for s in cat["secrets"]]))
    lignes = []
    for b in cat["builds"]:
        p = idx[b["personnage"]]
        lignes.append([b["id"], f"**{b['nom']}**", f"{p['id']} {p['nom']}",
                       [f"{t} {idx[t]['nom']}" for t in b["techniques"]], [f"{e} {idx[e]['nom']}" for e in b["evolutions"]],
                       b["passifs"], b["equipements"], f"{b.get('transformation') or '—'} / {p['ultime']}",
                       b["ordre"], b["remplacements"], b["fenetre"], b["faiblesse"], b["difficulte"]])
    ecrire("builds.md", f"# Builds assemblés — {len(cat['builds'])} entrées\n\nTous les composants existent et sont accessibles au personnage "
           "(vérifié). Les listes de techniques de plus de 6 éléments contiennent une fusion qui libère un emplacement.\n\n" + table(
        ["ID", "Build", "Personnage", "Techniques", "Évolutions visées", "Passifs", "Équipements", "Transformation / ultime",
         "Ordre de progression", "Remplacements", "Fenêtre de puissance", "Faiblesse", "Difficulté (1–5)"], lignes))

    # --- Sommaire et compteurs ---
    comptes = {k: len(v) for k, v in cat.items()}
    lignes_s = [[n, f"[{f}]({f})", c] for n, f, c in sommaire]
    texte = "# E. Catalogues exhaustifs\n\nSource de vérité : `data/*.yaml`. Exports : `catalogues/*.csv` (séparateur `;`) et `*.json`.\n\n"
    texte += "## Compteurs réels\n\n" + table(["Catalogue", "Entrées"], [[k, v] for k, v in comptes.items()])
    texte += "\n## Techniques par famille\n\n" + table(["Famille", "Fichier", "Entrées"], lignes_s)
    texte += "\n## Autres catalogues\n\n" + "\n".join(f"- [{n}]({n})" for n in [
        "evolutions.md", "synergies.md", "personnages.md", "passifs.md", "equipements.md", "transformations.md", "ultimes.md",
        "cartes.md", "boss.md", "ennemis.md", "missions.md", "secrets.md", "builds.md"]) + "\n"
    texte += "\n## Fiches approfondies (rédigées à la main)\n\n- [fiches_techniques.md](fiches_techniques.md) — 48 techniques sur 8 niveaux\n" \
             "- [fiches_personnages.md](fiches_personnages.md) — 24 personnages prioritaires\n"
    ecrire("README.md", texte)
    print("Généré :", comptes)


if __name__ == "__main__":
    main()
