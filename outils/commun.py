"""Chargement des données YAML et utilitaires partagés par valider.py et generer.py.

Aucune dépendance autre que PyYAML. Les fichiers sont regroupés par préfixe de nom.
"""
from __future__ import annotations

import glob
import os
import re

import yaml

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(RACINE, "data")

# Groupes de fichiers -> clé de catalogue
GROUPES = {
    "techniques": "techniques_*.yaml",
    "personnages": "personnages_*.yaml",
    "evolutions": "evolutions_*.yaml",
    "synergies": "synergies_*.yaml",
    "passifs": "passifs.yaml",
    "equipements": "equipements.yaml",
    "transformations": "transformations.yaml",
    "ultimes": "ultimes.yaml",
    "cartes": "cartes*.yaml",
    "boss": "boss*.yaml",
    "ennemis": "ennemis*.yaml",
    "missions": "missions*.yaml",
    "secrets": "secrets.yaml",
    "builds": "builds*.yaml",
    "vagues": "vagues.yaml",
}

PREFIXES = {
    "techniques": "JUT", "personnages": "CHR", "evolutions": "EVO", "synergies": "SYN",
    "passifs": "PAS", "equipements": "EQP", "transformations": "TRF", "ultimes": "ULT",
    "cartes": "MAP", "boss": "BOS", "ennemis": "ENM", "missions": "MIS", "secrets": "SEC",
    "builds": "BLD", "vagues": "VAG",
}

# Cibles de la bibliothèque complète (minimums du brief ; ULT est volontairement > 40)
CIBLES = {
    "techniques": (320, 320), "personnages": (80, 80), "evolutions": (120, 120),
    "synergies": (80, 80), "passifs": (60, 60), "equipements": (40, 40),
    "transformations": (24, None), "ultimes": (40, None), "cartes": (20, 20),
    "boss": (40, 40), "ennemis": (100, 100), "missions": (200, 200),
    "secrets": (60, 60), "builds": (40, 40),
}

FAMILLES = {
    "KATON": (1, 24), "SUITON": (25, 48), "RAITON": (49, 72), "FUTON": (73, 96),
    "DOTON": (97, 120), "RARE": (121, 160), "TAIJUTSU": (161, 184), "OUTIL": (185, 216),
    "INVOC": (217, 248), "GENJUTSU": (249, 264), "SCEAU": (265, 280), "CLAN": (281, 304),
    "OCULAIRE": (305, 320),
}

LIVRAISONS = {"PROJECTILE", "SALVE", "CONE", "ONDE", "CONTACT", "ORBITE", "ZONE", "PIEGE",
              "RAYON", "CHAINE", "INVOCATION", "DIFFERE"}

AFFINITES = {"E_KATON", "E_SUITON", "E_RAITON", "E_FUTON", "E_DOTON", "E_MOKUTON", "E_HYOTON",
             "E_SABLE", "E_JITON", "E_SHAKUTON", "E_YOTON", "E_BAKUTON", "E_RANTON", "E_ENTON",
             "E_FUTTON", "E_JINTON", "E_NEUTRE"}

TAGS_EFFET = {"UNITE_ALLIEE", "CLONE", "ANIMAL", "MARIONNETTE", "GEANT", "SECONDAIRE",
              "PERSISTANT", "TERRAIN", "PERCANT", "REBOND", "CONTROLE", "MARQUE", "SOIN",
              "BOUCLIER", "SACRIFICE", "EXPLOSIF", "ATTRACTION", "MOBILE", "SENSEUR"}

CIBLAGES = {"plus_proche", "plus_dense", "plus_menacant", "direction", "aleatoire_pondere",
            "marque", "chemin", "aucune"}

APTITUDES = {
    "ELEM_KATON", "ELEM_SUITON", "ELEM_RAITON", "ELEM_FUTON", "ELEM_DOTON",
    "KG_MOKUTON", "KG_HYOTON", "KG_SABLE", "KG_JITON", "KG_SHAKUTON", "KG_YOTON", "KG_BAKUTON",
    "KG_RANTON", "KG_ENTON", "KG_FUTTON", "KG_JINTON",
    "CLAN_UCHIHA", "CLAN_HYUGA", "CLAN_NARA", "CLAN_AKIMICHI", "CLAN_YAMANAKA", "CLAN_ABURAME",
    "CLAN_INUZUKA", "CLAN_UZUMAKI", "CLAN_SENJU", "CLAN_KAGUYA", "CLAN_HOZUKI", "CLAN_SARUTOBI",
    "DOJ_SHARINGAN", "DOJ_MANGEKYO", "DOJ_BYAKUGAN", "DOJ_RINNEGAN",
    "APT_FUIN", "APT_GEN", "APT_MED", "APT_KENJ", "APT_MARIO", "APT_SENJ", "APT_PORTES",
    "APT_JINCH", "APT_ENCRE", "APT_PAPIER", "APT_CORPS", "APT_RASEN",
    "CTR_CRAPAUD", "CTR_SERPENT", "CTR_LIMACE", "CTR_CHIEN", "CTR_SINGE", "CTR_FAUCON",
    "CTR_BELETTE", "CTR_REQUIN", "CTR_CORBEAU", "CTR_PALOURDE",
}

STATUTS = {"OA", "CO", "AV"}

ID_RE = re.compile(r"^[A-Z]{3}_\d{3}$")


def charger() -> dict[str, list[dict]]:
    """Charge tous les catalogues présents ; un groupe absent donne une liste vide."""
    cat: dict[str, list[dict]] = {}
    for cle, motif in GROUPES.items():
        entrees: list[dict] = []
        for chemin in sorted(glob.glob(os.path.join(DATA, motif))):
            with open(chemin, encoding="utf-8") as f:
                contenu = yaml.safe_load(f) or []
            for e in contenu:
                e["_fichier"] = os.path.relpath(chemin, RACINE)
            entrees.extend(contenu)
        cat[cle] = entrees
    return cat


def index(cat: dict[str, list[dict]]) -> dict[str, dict]:
    """Index global identifiant -> entrée (tous catalogues confondus)."""
    idx: dict[str, dict] = {}
    for entrees in cat.values():
        for e in entrees:
            if "id" in e:
                idx[e["id"]] = e
    return idx


def acces_satisfait(expr: str, perso: dict, aptitudes_extra: set[str] | None = None) -> bool:
    """Évalue une expression d'accès (registre §R5) pour un personnage.

    `A+B|C` : (A et B) ou C. `LIBRE` est toujours vrai. `CHR_nnn` désigne l'entrée elle-même.
    """
    if expr is None:
        return True
    apt = set(perso.get("aptitudes", [])) | (aptitudes_extra or set())
    for alternative in str(expr).split("|"):
        ok = True
        for jeton in alternative.split("+"):
            jeton = jeton.strip()
            if jeton == "LIBRE":
                continue
            if jeton.startswith("CHR_"):
                ok = ok and perso["id"] == jeton
            else:
                ok = ok and jeton in apt
        if ok:
            return True
    return False


def jetons_acces(expr: str) -> set[str]:
    out: set[str] = set()
    for alt in str(expr).split("|"):
        for j in alt.split("+"):
            out.add(j.strip())
    return out
