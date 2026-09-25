"""Référence de sauvegarde : versionnement, migration et écriture atomique (§G9).

Implémentation de référence en Python, indépendante du moteur. Le jeu (Godot) reproduira la même
logique ; ce module sert de spécification exécutable et de test de migration (tests_validateur.py).
Ce n'est pas le code du jeu et il n'a pas été testé dans un moteur.
"""
from __future__ import annotations

import json
import os
import tempfile

VERSION_COURANTE = 3
ENTREES_DE_DEPART = ["CHR_001", "CHR_004", "CHR_007"]


def _v1_vers_v2(d: dict) -> dict:
    # v2 : regroupement du profil ; ajout des entrées de départ introduites par une mise à jour de contenu
    entrees = list(dict.fromkeys(d.get("persos", []) + ENTREES_DE_DEPART))
    return {
        "version": 2,
        "profil": {"ryo": int(d.get("ryo", 0)), "entrees": entrees, "maitrise": dict(d.get("maitrise", {}))},
        "options": dict(d.get("options", {})),
    }


def _v2_vers_v3(d: dict) -> dict:
    # v3 : réglages d'accessibilité explicites, Archives, emplacement de reprise
    opt = d.get("options", {})
    return {
        "version": 3,
        "profil": {**d["profil"], "archives": d["profil"].get("archives", []), "secrets": d["profil"].get("secrets", [])},
        "reglages": {
            "accessibilite": {
                "reduire_flashs": not opt.get("flash", True),
                "secousses": opt.get("secousses", 1.0),
                "particules": opt.get("particules", "normal"),
                "sans_clignotement": opt.get("sans_clignotement", False),
                "taille_texte": opt.get("taille_texte", 1.0),
            },
            "commandes": opt.get("commandes", {}),
        },
        "reprise": None,  # une run en cours n'est jamais migrée entre versions majeures : elle est abandonnée proprement
    }


MIGRATIONS = {1: _v1_vers_v2, 2: _v2_vers_v3}


def migrer(d: dict) -> dict:
    """Applique les migrations successives jusqu'à VERSION_COURANTE. Ne supprime jamais un déblocage."""
    v = d.get("version", 1)
    if v > VERSION_COURANTE:
        raise ValueError("sauvegarde plus récente que le jeu : lecture seule")
    while v < VERSION_COURANTE:
        d = MIGRATIONS[v](d)
        v = d["version"]
    return d


def ecrire_atomique(chemin: str, donnees: dict) -> None:
    """Écrit dans un fichier temporaire du même dossier, force l'écriture disque, puis renomme.

    Un ancien fichier « .bak » est conservé (dernière sauvegarde valide) pour la reprise après coupure.
    """
    dossier = os.path.dirname(os.path.abspath(chemin))
    fd, tmp = tempfile.mkstemp(dir=dossier, prefix=".tmp_", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(donnees, f, ensure_ascii=False, indent=1)
        f.flush()
        os.fsync(f.fileno())
    if os.path.exists(chemin):
        os.replace(chemin, chemin + ".bak")
    os.replace(tmp, chemin)


def lire(chemin: str) -> dict:
    """Lit la sauvegarde ; en cas de fichier corrompu, retombe sur la copie « .bak »."""
    for c in (chemin, chemin + ".bak"):
        try:
            with open(c, encoding="utf-8") as f:
                return migrer(json.load(f))
        except (OSError, ValueError, json.JSONDecodeError):
            continue
    return migrer({"version": 1})
