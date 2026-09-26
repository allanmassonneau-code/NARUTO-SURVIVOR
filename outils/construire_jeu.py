"""Construit le jeu jouable (prototype/index.html) à partir des catalogues du dossier.

Lit data/*.yaml (source de vérité), extrait les paramètres chiffrés des champs texte
(valeurs, zones d'attaque, statistiques…), puis assemble prototype/src/*.js et les
données en une page unique. Rapporte la couverture : ce que le moteur simule
exactement, ce qu'il approche par un comportement générique.

Usage : python3 outils/construire_jeu.py [--rapport]
"""
from __future__ import annotations

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun  # noqa: E402

RACINE = commun.RACINE
SRC = os.path.join(RACINE, "prototype", "src")
SORTIE = os.path.join(RACINE, "prototype", "index.html")

NUM = r"(\d+(?:[.,]\d+)?)"


def f(x: str) -> float:
    return float(x.replace(",", "."))


def cherche(motif: str, texte: str, defaut=None, groupe=1):
    m = re.search(motif, texte, re.I)
    if not m:
        return defaut
    g = m.group(groupe) if groupe != 1 else next((x for x in m.groups() if x), None)
    return f(g) if g else defaut


# ---------------------------------------------------------------- états (§R7)
ETATS = [
    ("STA_01", r"Brûlure(?: noire)?"), ("STA_02", r"huile|Imbibé"), ("STA_03", r"Trempé"),
    ("STA_04", r"Électris"), ("STA_05", r"Refroidi|Gel[ée]"), ("STA_06", r"Ensablé|Enseveli"),
    ("STA_07", r"Lié"), ("STA_08", r"Empoisonn|Poison"), ("STA_09", r"Marqu"),
    ("STA_10", r"Confus"), ("STA_11", r"Étourdi|endorm"), ("STA_12", r"Vulnérable"),
    ("STA_14", r"Parasit"), ("STA_15", r"argile"), ("STA_16", r"Aveugl"), ("STA_17", r"Corrod"),
    ("STA_18", r"Entaill|saign"), ("STA_19", r"Entrav|racines"), ("STA_21", r"Encr"),
    ("STA_22", r"Aimant"), ("STA_23", r"Vapeur"),
]


def etats(texte: str) -> list:
    out = []
    for code, motif in ETATS:
        m = re.search(r"(?:" + motif + r")\w*\s*(?:\+|×)?\s*" + NUM + r"?\s*(s|%)?", texte, re.I)
        if m:
            v = f(m.group(1)) if m.group(1) else 1.0
            unite = m.group(2) or ""
            out.append([code, v, unite])
    return out


# ---------------------------------------------------------------- techniques
def degats(val: str) -> tuple[float, int, str]:
    """Retourne (dégâts par touche, nombre de touches, source de l'analyse)."""
    m = re.search(r"(\d+)\s*[×x]\s*(\d+)(?!\s*(?:s\b|m\b|%))", val)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        # « 8 × 45 » = 8 coups de 45 ; « 2 × 12 » = 2 coups de 12
        return float(b), a, "n×d"
    m = re.search(r"(\d+)\s*/\s*(\d+)(?:\s*/\s*(\d+))?", val)
    if m and not re.search(r"\d+\s*/\s*\d+\s*(?:s|m)", val[m.start():m.end() + 3]):
        nums = [int(g) for g in m.groups() if g]
        return sum(nums) / len(nums), len(nums), "combo"
    m = re.search(r"(\d+)\s*\+\s*(\d+)(?!\s*(?:s|m|%))", val)
    if m:
        return float(int(m.group(1)) + int(m.group(2))), 1, "a+b"
    # premier entier « nu » (pas une durée, distance, pourcentage, vitesse, angle)
    for m in re.finditer(r"(?<![\d,.])(\d+)(?![.,]\d)(?!\s*(?:s\b|m\b|m/s|%|°|tour|PV/s|charges?|cibles?|pics|aiguilles|frappes|clones|générations|instances|max|attaques?|projectiles?|réanimé|sauts?))", val):
        avant = val[max(0, m.start() - 22):m.start()].lower()
        if re.search(r"(délai|durée|plafond|max|rotation|vitesse|intervalle|stock|jusqu|cumuls?|armure|×|\+|min)\s*$", avant):
            continue
        if int(m.group(1)) == 0:
            continue
        return float(m.group(1)), 1, "premier"
    return 0.0, 1, "aucun"


def params_technique(t: dict) -> dict:
    val, comp = t.get("valeurs", "") or "", t.get("comportement", "") or ""
    tout = val + " ; " + comp
    d, n, src = degats(val)
    p = {"d": d, "n": n, "src": src}
    p["tick"] = cherche(r"par tick de " + NUM + r"\s*s", val)
    p["del"] = cherche(r"délai(?! d'impact| interne)\s*(?:de\s*)?" + NUM + r"\s*s", val)
    p["icd"] = cherche(r"délai interne\s*" + NUM + r"\s*s", val)
    p["imp"] = cherche(r"délai d'impact\s*" + NUM + r"\s*s", val)
    p["dur"] = cherche(r"durée\s*" + NUM + r"\s*s", val)
    p["perm"] = 1 if re.search(r"permanent", val, re.I) else 0
    p["r"] = cherche(r"(?:\br|rayon)\s*" + NUM + r"\s*m", tout)
    p["w"] = cherche(r"largeur\s*" + NUM + r"\s*m", tout)
    p["len"] = cherche(r"(?:longueur|ligne \()\s*" + NUM + r"\s*m", tout)
    p["port"] = cherche(r"portée\s*" + NUM + r"\s*m", tout) or cherche(r"(?:jusqu'à|sur|à ≤|à)\s*" + NUM + r"\s*m", comp)
    p["vit"] = cherche(r"vitesse\s*(?:du mur\s*)?" + NUM + r"\s*m/s", val)
    p["ang"] = cherche(NUM + r"\s*°", tout)
    p["kb"] = cherche(r"recul\s*" + NUM + r"\s*m", tout)
    p["sec"] = cherche(r"(?:explosion|onde|éclatement|décharge|explose)\s*" + NUM, val)
    p["cibles"] = cherche(NUM + r"\s*cibles", val)
    p["pics"] = cherche(NUM + r"\s*(?:pics|aiguilles|projectiles|kunai|shuriken|traits|lames|clones|requins|galets|oiseaux|pointes|tiges)", tout)
    p["max"] = cherche(r"(?:max|plafond)\s*" + NUM, val)
    p["chute"] = cherche(r"−\s*" + NUM + r"\s*%\s*/\s*saut", val)
    p["soin"] = cherche(r"soin\s*" + NUM, val)
    p["bouclier"] = cherche(r"bouclier\s*(?:de\s*)?" + NUM, tout)
    p["armure"] = cherche(r"Armure\s*\+\s*" + NUM, val)
    p["pct"] = cherche(r"\+\s*" + NUM + r"\s*%", val)
    p["st"] = etats(tout)
    p["perce"] = 1 if "PERCANT" in t.get("tags", []) or re.search(r"traverse|perce", tout, re.I) else 0
    p["rebond"] = 1 if "REBOND" in t.get("tags", []) else 0
    return {k: v for k, v in p.items() if v not in (None, 0, 0.0, [], "")}


# Barème générique de niveaux (en l'absence de table de production, §Z5) : multiplicateurs
# cumulés appliqués aux paramètres de niveau 1. Chaque niveau modifie UNE chose, lisible.
BAREME = [
    None,
    {"txt": "Base"},
    {"d": 1.15, "txt": "Dégâts +15 %"},
    {"zone": 1.15, "txt": "Portée et rayon +15 %"},
    {"q": 1, "txt": "+1 projectile, unité, coup ou instance"},
    {"d": 1.20, "txt": "Dégâts +20 %"},
    {"del": 0.85, "txt": "Délai −15 %"},
    {"dur": 1.25, "st": 1, "txt": "Durée +25 % et états +1 cumul"},
    {"d": 1.25, "q": 1, "txt": "Dégâts +25 % et +1 quantité"},
]


def niveaux_fiches() -> dict:
    """Tables 8 niveaux des fiches approfondies (texte des changements)."""
    chemin = os.path.join(RACINE, "dossier", "E_catalogues", "fiches_techniques.md")
    txt = open(chemin, encoding="utf-8").read()
    out = {}
    for bloc in re.split(r"\n## ", txt):
        m = re.match(r"(JUT_\d{3})", bloc)
        if not m:
            continue
        lignes = {}
        for l in re.finditer(r"^\|\s*(\d)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$", bloc, re.M):
            niv = int(l.group(1))
            ch, res = l.group(2), l.group(3)
            lignes[niv] = (ch + ("" if res in ("—", "") else " — " + res)).replace("**", "")
        if len(lignes) == 8:
            out[m.group(1)] = lignes
    return out


def analyse_niveau(texte: str) -> dict:
    """Traduit une ligne de fiche en modificateurs (valeurs absolues quand « A → B »)."""
    mod = {}
    t = texte
    m = re.search(r"(?:Dégâts|Impact|Frappe|dégâts)[^→\d]*" + NUM + r"\s*→\s*" + NUM, t)
    if m:
        mod["d_abs"] = f(m.group(2))
    elif re.match(r"\s*Dégâts", t):
        m2 = re.search(r"(?:Impact|Frappe|Coup|Jet|Contact)?\s*(\d+)(?!\s*(?:s|m|%))", t.split("—")[-1])
        if m2:
            mod["d_abs"] = f(m2.group(1))
        else:
            mod["d"] = 1.2
    m = re.search(r"[Dd]élai[^→]*?" + NUM + r"\s*→\s*" + NUM, t)
    if m:
        mod["del_abs"] = f(m.group(2))
    m = re.search(r"[Dd]urée[^→]*?" + NUM + r"\s*→\s*" + NUM, t)
    if m:
        mod["dur_abs"] = f(m.group(2))
    m = re.search(r"(?:[Rr]ayon|[Oo]nde|[Pp]ortée|[Ll]ongueur|[Ll]argeur|[Zz]one)[^→]*?" + NUM + r"\s*→\s*" + NUM + r"\s*m", t)
    if m:
        mod["zone"] = f(m.group(2)) / max(0.01, f(m.group(1)))
    if re.search(r"\+\s*1\b|[Dd]eux |[Tt]rois |[Tt]ir double|\bsecond", t) and "d_abs" not in mod:
        mod["q"] = 1
    if not mod:
        mod["d"] = 1.10
        mod["approx"] = 1
    return mod


def techniques(C) -> tuple[list, dict]:
    fiches = niveaux_fiches()
    out, cov = [], {"analyse": 0, "sans_degats": 0, "fiche": 0}
    for t in C["techniques"]:
        p = params_technique(t)
        cov["analyse"] += 1
        if not p.get("d"):
            cov["sans_degats"] += 1
        e = {k: t[k] for k in ("id", "nom", "famille", "livraison", "tags", "cible", "acces", "statut")}
        e["comp"], e["val"], e["lim"] = t.get("comportement", ""), t.get("valeurs", ""), t.get("limites", "")
        e["p"] = p
        if t["id"] in fiches:
            cov["fiche"] += 1
            e["niv"] = [None] + [[fiches[t["id"]][i], analyse_niveau(fiches[t["id"]][i])] for i in range(1, 9)]
        out.append(e)
    return out, cov


def evolutions(C) -> list:
    out = []
    for e in C["evolutions"]:
        pseudo = {"valeurs": e.get("valeurs", ""), "comportement": e.get("comportement", ""), "tags": []}
        out.append({"id": e["id"], "nom": e["nom"], "type": e["type"], "src": e["sources"],
                    "cata": e.get("catalyseurs") or [], "tard": e.get("condition_tardive"),
                    "comp": e.get("comportement", ""), "val": e.get("valeurs", ""),
                    "lim": e.get("limites", ""), "statut": e.get("statut"), "p": params_technique(pseudo)})
    return out


# ---------------------------------------------------------------- statistiques textuelles
STATS = [
    ("pow", r"Puissance"), ("cad", r"Cadence"), ("zone", r"Zone|rayon"), ("dur", r"Durée|durée"),
    ("qte", r"Quantité"), ("vproj", r"vitesse des projectiles|Vitesse proj"), ("crit", r"chance critique|Chance critique|Critique"),
    ("critd", r"multiplicateur critique|Dégâts critiques"), ("move", r"déplacement|Déplacement"),
    ("armor", r"Armure"), ("regen", r"Régénération|PV/s"), ("pickup", r"rayon de collecte|collecte"),
    ("hp", r"PV max"), ("chakra", r"gain de chakra|chakra"), ("xp", r"gain d'XP|XP"), ("luck", r"Chance\b"),
    ("red", r"Réduction des dégâts|dégâts subis"), ("delred", r"délai"), ("lifesteal", r"rendus en PV"),
]


def stats_texte(texte: str) -> dict:
    """Extrait les bonus « +X % Stat » / « Stat +X » d'un texte (inconditionnels uniquement)."""
    out = {}
    if not texte:
        return out
    for morceau in re.split(r"[;.]", texte):
        if re.search(r"\b(si|sous|après|pendant|quand|lorsque|au-dessus|tant que|à moins|contre|aux ennemis|niv\.)\b", morceau, re.I):
            continue
        for cle, motif in STATS:
            m = re.search(r"(?:" + motif + r")\s*(?:effective\s*)?([+−-])\s*" + NUM + r"\s*(%|/s)?", morceau) or \
                re.search(r"([+−-])\s*" + NUM + r"\s*(%|/s)?\s*(?:de |d'|au |aux |à la )?(?:" + motif + r")", morceau)
            if m:
                signe = -1 if m.group(1) in "−-" else 1
                v = f(m.group(2)) * signe
                if m.group(3) == "%":
                    v /= 100
                out[cle] = out.get(cle, 0) + v
                break
        m = re.search(r"Dégâts\s*×\s*" + NUM, morceau)
        if m:
            out["mult"] = f(m.group(1))
    return out


def passifs(C) -> list:
    out = []
    for p in C["passifs"]:
        s = stats_texte(p["par_niveau"])
        filtre = [x.strip() for x in str(p.get("applique_a", "TOUT")).split(",")]
        dmg = cherche(r"\+\s*" + NUM + r"\s*%\s*(?:de\s*)?dégâts", p["par_niveau"])
        out.append({"id": p["id"], "nom": p["nom"], "stat": p["stat"], "txt": p["par_niveau"],
                    "filtre": filtre, "acces": p["acces"], "s": s, "dmg": (dmg or 0) / 100, "statut": p.get("statut")})
    return out


def equipements(C) -> list:
    out = []
    for e in C["equipements"]:
        s = stats_texte(e["effet"])
        c = stats_texte(e.get("contrainte", "") or "")
        out.append({"id": e["id"], "nom": e["nom"], "rar": e["rarete"], "role": e["role"], "acces": e["acces"],
                    "txt": e["effet"], "contr": e.get("contrainte", ""), "s": s, "sc": c,
                    "dmg": (cherche(r"\+\s*" + NUM + r"\s*%\s*(?:de\s*)?dégâts", e["effet"]) or 0) / 100})
    return out


def secondes(txt: str, defaut: float) -> float:
    return cherche(NUM + r"\s*s", txt or "", defaut)


def transformations(C) -> list:
    out = []
    for t in C["transformations"]:
        rech = t.get("recharge", "")
        out.append({"id": t["id"], "nom": t["nom"], "acces": t["acces"], "obt": t["obtention"],
                    "dur": secondes(t["duree"], 12), "rech": 9999 if "une fois" in rech.lower() else secondes(rech, 90),
                    "cout": t["cout"], "auto": t["auto"], "stats": t["stats"], "comp": t["comportements"],
                    "lim": t.get("limites", ""), "fin": t.get("fin", ""), "aura": t.get("aura", ""),
                    "s": stats_texte(t["stats"]), "pvs": cherche(NUM + r"\s*PV/s", t["cout"] or "", 0),
                    "statut": t.get("statut")})
    return out


def ultimes(C) -> list:
    out = []
    for u in C["ultimes"]:
        v = u.get("valeurs", "")
        d, n, _ = degats(v)
        out.append({"id": u["id"], "nom": u["nom"], "users": u["utilisateurs"], "effet": u["effet"], "val": v,
                    "vide": u.get("a_vide", ""), "maitrise": u.get("maitrise", ""),
                    "p": {"d": d or 60, "n": max(1, n), "r": cherche(r"(?:\br|rayon)\s*" + NUM + r"\s*m", v + u["effet"], 1.5),
                          "dur": cherche(r"(?:durée|pendant)\s*" + NUM + r"\s*s", v + " " + u["effet"], 1.5),
                          "bouclier": cherche(r"bouclier\s*" + NUM + r"\s*%", v, 0), "st": etats(v + " " + u["effet"]),
                          "zone": cherche(NUM + r"\s*m", u["effet"], 8)}})
    return out


# ---------------------------------------------------------------- ennemis et boss
def ennemis(C) -> list:
    out = []
    for e in C["ennemis"]:
        out.append({k: e.get(k) for k in ("id", "nom", "role", "pv", "vitesse", "degats", "xp", "cartes", "comportement", "annonce", "modificateur")}
                   | {"elite": bool(e.get("elite")), "p": {"port": cherche(r"(?:à|reste à|portée)\s*" + NUM + r"\s*m", e["comportement"]),
                                                             "tele": cherche(r"[Tt]élégraphe\s*" + NUM + r"\s*s|[Vv]ise\s*" + NUM, e["comportement"]),
                                                             "cd": cherche(r"toutes les\s*" + NUM + r"\s*s", e["comportement"])}})
    return out


def forme_zone(z: str) -> dict:
    """Traduit le texte d'une zone d'attaque de boss en forme géométrique.

    Formes : soi (buff/soin/renvoi), arene (tout sauf zones sûres), mur (avec brèches),
    eventail (N projectiles), sinus, arc, ligne (N lignes, aller-retour), etoile (N branches),
    tir (projectile + explosion), cercle (centre joueur ou boss, N cercles, suivi).
    """
    zl = z.lower()
    g = {"txt": z}
    ang = cherche(NUM + r"\s*°", z)
    mots_n = {"deux": 2, "trois": 3, "quatre": 4, "cinq": 5, "six": 6, "huit": 8}
    n_mot = next((v for k, v in mots_n.items() if re.search(r"\b" + k + r"\b", zl)), None)
    if zl.startswith("aucune"):
        g.update(forme="soi", soin=cherche(NUM + r"\s*%\s*de PV", z, 0), renvoi=1 if "renvoie" in zl else 0)
        return g
    if "arène entière" in zl or ("sauf" in zl and re.search(r"îlot|sûrs|pilier", zl)):
        g.update(forme="arene", sures=int(cherche(r"(\d+)\s*(?:îlots|piliers|cercles sûrs|zones)", z, 3)),
                 r=cherche(r"(?:îlots circulaires de|cercles de|cercle de|de)\s*" + NUM + r"\s*m", z, 2.5),
                 R=cherche(r"cercle de\s*" + NUM + r"\s*m sauf", z, 0))
        return g
    if "mur" in zl:
        g.update(forme="mur", w=cherche(NUM + r"\s*m de large", z, 16), len=cherche(r"avance de\s*" + NUM, z, 10),
                 breches=int(cherche(r"(\d+)\s*brèches?", z, 2)))
        return g
    if "étoile" in zl:
        g.update(forme="etoile", n=int(cherche(r"(\d+)\s*(?:branches|requins|pointes|lignes)", z, 8)), len=cherche(NUM + r"\s*m", z, 7), w=1.0,
                 retour=1 if "reviennent" in zl or "retour" in zl else 0)
        return g
    if "éventail" in zl or re.search(r"\d+\s*(aiguilles|shuriken|kunai|balles|lames)", zl):
        g.update(forme="eventail", n=int(cherche(r"(\d+)\s*(?:aiguilles|shuriken|kunai|projectiles|balles|lames|traits|lignes)", z, 5)),
                 ang=ang or 60, port=cherche(r"portée\s*" + NUM, z, 10))
        return g
    if "sinueux" in zl:
        g.update(forme="sinus", w=cherche(NUM + r"\s*m de large", z, 1), len=cherche(r"sur\s*" + NUM + r"\s*m", z, 14),
                 amp=cherche(r"amplitude\s*" + NUM, z, 1))
        return g
    if "absorbe les projectiles" in zl:
        g.update(forme="soi", soin=0, renvoi=1, r=cherche(NUM + r"\s*m", z, 3))
        return g
    if re.search(r"^onde de", zl) or ("autour de" in zl and "joueur" not in zl and "onde" in zl):
        g.update(forme="cercle", centre="boss", r=cherche(NUM + r"\s*m", z, 5), n=1, repousse=cherche(r"repousse[^0-9]*" + NUM, z, 0))
        return g
    if "anneau" in zl or "converge" in zl or "contracte" in zl:
        g.update(forme="cercle", centre="joueur", r=cherche(NUM + r"\s*m", z, 3), n=1)
        return g
    if re.search(r"projectile|boule|balle|missile|orbe|araignées", zl) and "ligne droite" not in zl:
        g.update(forme="tir", n=int(cherche(r"(\d+)\s*(?:missiles|araignées|orbes|balles|boules)", z, 1)),
                 r=cherche(r"(?:explose en|explosion|explosent \()\s*" + NUM + r"\s*m", z, 2), vit=6 if "lent" in zl else 9,
                 chercheur=1 if "chercheu" in zl or "marchent vers" in zl else 0)
        return g
    if ("arc" in zl or "cône" in zl or "balayage" in zl) and (ang or "cône" in zl):
        g.update(forme="arc", ang=ang or 60, r=cherche(r"(?:sur|à|de)\s*" + NUM + r"\s*m", z, 3.5))
        return g
    m = re.search(NUM + r"\s*m?\s*×\s*" + NUM + r"\s*m", z)
    if "ligne" in zl or "large sur" in zl or m or "dash" in zl or "rectangle" in zl or "traverse" in zl:
        if m:
            a1, a2 = f(m.group(1)), f(m.group(2))
            g["w"], g["len"] = min(a1, a2), max(a1, a2)
        else:
            g["w"] = cherche(NUM + r"\s*m(?: de)? (?:de )?large", z, 1.2)
            g["len"] = cherche(r"sur\s*" + NUM + r"\s*m", z) or cherche(r"(?:ligne de|lignes? de \w+ de|de)\s*" + NUM + r"\s*m", z, 12)
        g.update(forme="ligne", n=int(cherche(r"(\d+)\s*lignes", z, n_mot or 1)), retour=1 if "retour" in zl else 0,
                 attire=1 if "attire" in zl else 0)
        return g
    centre = "boss" if re.search(r"autour (?:de|du corps)|autour d'|bulle", zl) and "joueur" not in zl else "joueur"
    g.update(forme="cercle", centre=centre, r=cherche(r"(?:cercles? de|explosion|de)\s*" + NUM + r"\s*m", z) or cherche(NUM + r"\s*m", z, 2),
             n=int(cherche(r"(\d+)\s*(?:cercles|ombres|zones|bombes|points)", z, n_mot or 1)),
             suit=cherche(r"suit(?: le joueur)?\s*" + NUM, z, 0), grandit=cherche(r"grandi\w* sur\s*" + NUM, z, 0),
             repousse=cherche(r"repousse[^0-9]*" + NUM, z, 0), attire=1 if "attire" in zl else 0)
    if not re.search(r"cercle|sous le joueur|point|ombre|onde|bulle|sphère|pluie|zone", zl):
        g["approx"] = 1
    return g


def boss(C) -> tuple[list, dict]:
    out, cov = [], {"attaques": 0, "approchees": 0, "kit_generique": 0}
    for b in C["boss"]:
        e = {k: b.get(k) for k in ("id", "nom", "statut", "niveau_detail", "cartes", "role_carte", "pv", "resistance",
                                    "silhouette", "entree", "deplacement", "mecanique", "vulnerabilites", "controle", "conclusion", "hitbox")}
        e["phases"] = b.get("phases") or []
        atk = []
        for a in b.get("attaques", []) or []:
            g = forme_zone(a["zone"])
            cov["attaques"] += 1
            cov["approchees"] += g.get("approx", 0)
            atk.append({"nom": a["nom"], "g": g, "tele": a.get("avertissement", 1.0), "act": a.get("active", 0.3),
                        "d": a.get("degats", 0), "rec": a.get("recuperation", 1.2), "rep": a.get("reponse", ""), "info": a.get("info", "")})
        if not atk:
            cov["kit_generique"] += 1
        e["atk"] = atk
        e["hit"] = cherche(r"[Cc]ercle de\s*" + NUM + r"\s*m", b.get("hitbox", "") or "", 0.9)
        e["px"] = cherche(NUM + r"\s*px", b.get("silhouette", "") or "", 32)
        out.append(e)
    return out, cov


# ---------------------------------------------------------------- cartes, missions, secrets
PALETTES = [
    (r"verts?|forêt|feuill", "#4f6a45", "#5b7a50"), (r"sable|désert|ocre", "#b39664", "#c2a574"),
    (r"brume|gris|pierre|ruine", "#5d6065", "#676a70"), (r"neige|blanc|glace", "#c8ced6", "#d6dce3"),
    (r"eau|mer|pluie|turquoise|bleu", "#4d6b7c", "#587a8c"), (r"rouge|lave|feu|braise", "#6a3f36", "#7a4a3f"),
    (r"nuit|sombre|violet|noir", "#34323f", "#3d3a4a"), (r"bois|brun|terre", "#6b5a44", "#78664f"),
]


def couleurs(pal: str):
    for motif, a, b in PALETTES:
        if re.search(motif, pal or "", re.I):
            return [a, b]
    return ["#5d6065", "#676a70"]


def cartes(C) -> list:
    out = []
    for m in C["cartes"]:
        taille = cherche(NUM + r"\s*×", m.get("taille", ""), 160)
        dens = 1.4 if re.search(r"dense|élevé|fort", m.get("obstacles", ""), re.I) else 0.6 if re.search(r"faible|peu|aucun", m.get("obstacles", ""), re.I) else 1.0
        out.append({k: m.get(k) for k in ("id", "nom", "statut", "trace", "palette", "obstacles", "ressources", "ennemis", "evenement", "boss", "boss_secondaires", "secret", "contrainte", "taille")}
                   | {"col": couleurs(m.get("palette", "")), "m": taille, "dens": dens,
                      "evt_t": cherche(r"\((\d+):(\d+)\)", m.get("evenement", "") or "", None)})
    return out


COMPTEURS = [
    (r"transformations? différentes", "trf_dist"), (r"transformations?", "trf"), (r"éveil", "eveils"), (r"fusion", "fusions"),
    (r"évolution", "evolutions"), (r"recettes", "recettes"), (r"esquives parfaites", "esq_parf"), (r"équipements différents", "eqp_dist"),
    (r"au CONTACT", "kills_contact"), (r"ennemis confus", "kills_confus"), (r"Conductions?", "SYN_001"), (r"Parasité ou de Poison|Poison", "STA_08"),
    (r"Parasité", "STA_14"), (r"contrôles de genjutsu", "ctrl_gen"), (r"cellules d'huile|Embraser", "SYN_003"), (r"obstacles", "obstacles"),
    (r"projectiles", "parades"), (r"Éclosions", "eclosions"), (r"secrets?", "secrets"), (r"élites?", "kills_elite"), (r"boss", "kills_boss"),
    (r"ennemis|éliminations", "kills"), (r"Rations", "rations"), (r"ultimes?", "ultimes"), (r"unités ANIMAL|compagnons ANIMAL", "animaux_simult"),
    (r"cellules de BOIS", "bois_simult"), (r"Ryō", "ryo_total"), (r"runs?", "runs"), (r"maîtrise", "maitrise"),
]


def missions(C) -> list:
    noms_boss = []
    for b in C["boss"]:
        court = re.split(r" \(| — |, ", b["nom"])[0]
        noms_boss.append((b["id"], court))
        premier = court.split(" ")[0]
        if len(premier) >= 4 and premier != court:
            noms_boss.append((b["id"], premier))
    noms_perso = [(p["id"], re.split(r" — | \(", p["nom"])[0].split(" ")[0]) for p in C["personnages"] if p["type"] == "BASE"]
    cartes_boss = {m["id"]: m.get("boss") for m in C["cartes"]}
    out = []
    for m in C["missions"]:
        cond = m["condition"]
        crit = {"type": "texte"}
        rang = re.search(r"rang (S\+|S|A|B|C|D)", cond)
        avec = re.search(r"[Aa]vec ([A-ZÀ-Ý][\wōū\-]+)", cond)
        if re.search(r"(?:Survivre|Tenir) (\d+) min", cond):
            crit = {"type": "survivre", "min": cherche(r"(?:Survivre|Tenir) (\d+) min", cond)}
        cibles = list(dict.fromkeys(bid for bid, nom in noms_boss if re.search(r"\b" + re.escape(nom) + r"\b", cond) or bid in cond))
        if re.search(r"[Vv]aincre|[Ee]nchaîner", cond) and (cibles or "le boss" in cond):
            crit = {"type": "vaincre", "boss": cibles or [cartes_boss.get(m.get("carte"))], "min": crit.get("min"),
                    "tous": 1 if re.search(r"[Ee]nchaîner| et ", cond) else 0}
        elif re.search(r"[Tt]erminer", cond):
            crit = {"type": "terminer"}
        mn = re.search(r"\bniveau (\d+)", cond)
        if mn and crit["type"] == "texte" and "maîtrise" not in cond:
            crit = {"type": "niveau", "n": int(mn.group(1))}
        if crit["type"] == "texte":
            nombre = re.search(r"(\d[\d  ]*)\s", cond)
            for motif, cle in COMPTEURS:
                if re.search(motif, cond):
                    n = int(re.sub(r"\D", "", nombre.group(1))) if nombre else 1
                    crit = {"type": "compteur", "cle": cle, "n": n, "run": 1 if "en une run" in cond or "simultan" in cond or "pendant" in cond else 0}
                    break
        ms = re.search(r"maîtrise (\d+)", cond)
        if ms:
            crit["maitrise"] = int(ms.group(1))
        if rang:
            crit["rang"] = rang.group(1)
        if avec:
            pid = next((i for i, n in noms_perso if n == avec.group(1)), None)
            if pid:
                crit["avec"] = pid
        if re.search(r"sans (?:aucune )?assistance", cond) or m["type"] == "expert":
            crit["sans_aide"] = 1
        out.append({k: m.get(k) for k in ("id", "nom", "type", "mode", "carte", "personnage", "rang", "condition", "recompenses", "dependances")}
                   | {"crit": crit})
    return out


def secrets_(C) -> list:
    return [{k: s.get(k) for k in ("id", "nom", "type", "carte", "condition", "indices", "recompense", "dependances")} for s in C["secrets"]]


def personnages(C) -> list:
    out = []
    for p in C["personnages"]:
        e = {k: p.get(k) for k in ("id", "nom", "type", "base", "prioritaire", "identite", "depart", "stats", "cpx", "faiblesse",
                                    "signature", "aptitudes", "ultime", "transformations", "deblocage", "orientations")}
        e["s"] = stats_texte((p["stats"].get("notes") or ""))
        e["scpx"] = stats_texte(p["cpx"]["effet"])
        out.append(e)
    return out


# ---------------------------------------------------------------- page
def construire(rapport: bool = False) -> dict:
    C = commun.charger()
    tech, cov_t = techniques(C)
    bos, cov_b = boss(C)
    D = {
        "techniques": tech, "evolutions": evolutions(C), "personnages": personnages(C), "passifs": passifs(C),
        "equipements": equipements(C), "transformations": transformations(C), "ultimes": ultimes(C),
        "ennemis": ennemis(C), "boss": bos, "cartes": cartes(C), "missions": missions(C), "secrets": secrets_(C),
        "synergies": [{k: s.get(k) for k in ("id", "nom", "statut", "references", "condition", "effet", "limite", "plafond", "compatibilite", "contrepartie", "manifestation", "boss_isole")} for s in C["synergies"]],
        "builds": [{k: b.get(k) for k in ("id", "nom", "personnage", "difficulte", "techniques", "passifs", "equipements", "evolutions", "transformation", "ordre", "fenetre", "faiblesse", "remplacements")} for b in C["builds"]],
        "vagues": [{k: v.get(k) for k in ("id", "carte", "mode", "segments")} for v in C["vagues"]],
    }
    cov = {"techniques": cov_t, "boss": cov_b,
           "missions_suivies": sum(1 for m in D["missions"] if m["crit"]["type"] != "texte"),
           "passifs_chiffres": sum(1 for p in D["passifs"] if p["s"] or p["dmg"]),
           "equipements_chiffres": sum(1 for e in D["equipements"] if e["s"] or e["dmg"])}
    D["couverture"] = cov
    js_donnees = "const DATA=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n"
    morceaux = []
    for nom in sorted(os.listdir(SRC)):
        if nom.endswith(".js"):
            morceaux.append(f"// ---- {nom}\n" + open(os.path.join(SRC, nom), encoding="utf-8").read())
    page = open(os.path.join(SRC, "page.html"), encoding="utf-8").read()
    page = page.replace("/*__DONNEES__*/", js_donnees).replace("/*__MOTEUR__*/", "\n".join(morceaux))
    with open(SORTIE, "w", encoding="utf-8") as fh:
        fh.write(page)
    if rapport:
        print(json.dumps(cov, ensure_ascii=False, indent=1))
        print(f"page : {SORTIE} ({len(page) // 1024} Kio)")
    return D


if __name__ == "__main__":
    construire(rapport="--rapport" in sys.argv or True)
