"""Tests automatiques du validateur de contenu (§H7) — exécution : python3 outils/tests_validateur.py

Chaque test injecte une erreur connue dans une copie du catalogue et vérifie qu'elle est détectée.
Ces tests prouvent que les garde-fous fonctionnent ; ils ne testent pas le jeu lui-même.
"""
from __future__ import annotations

import copy
import sys

import valider as V
from commun import charger, index
from sauvegarde import migrer, VERSION_COURANTE


def lancer(nom, mutation, verifs, attendu):
    cat = charger()
    c2 = copy.deepcopy(cat)
    mutation(c2)
    idx = index(c2)
    r = V.Rapport()
    for f in verifs:
        f(c2, idx, r)
    ok = any(attendu in e for e in r.erreurs)
    print(("OK   " if ok else "ÉCHEC") + f" {nom}")
    return ok


def main() -> int:
    resultats = []
    # 1. doublon d'identifiant
    resultats.append(lancer("doublon d'identifiant",
                            lambda c: c["techniques"].append(dict(c["techniques"][0])),
                            [lambda c, i, r: V.verifier_ids(c, r)], "doublon"))
    # 2. recette inaccessible (catalyseur réservé à une aptitude que personne n'a avec la source)
    def m2(c):
        e = dict(c["evolutions"][0]); e["id"] = "EVO_121"; e["sources"] = ["JUT_170"]; e["catalyseurs"] = ["PAS_055"]
        c["evolutions"].append(e)
    resultats.append(lancer("recette inaccessible", m2, [V.verifier_evolutions], "réalisable par aucun"))
    # 3. cycle de déblocage (mission qui exige le personnage qu'elle débloque)
    def m3(c):
        m = next(x for x in c["missions"] if x["id"] == "MIS_112")
        m["personnage"] = "CHR_012"
    resultats.append(lancer("cycle de déblocage", m3, [V.verifier_missions_deblocages], "exige de posséder"))
    # 4. dépassement d'emplacements
    def m4(c):
        c["builds"][0]["techniques"] = c["builds"][0]["techniques"] + ["JUT_186", "JUT_187"]
    resultats.append(lancer("dépassement d'emplacements", m4, [V.verifier_builds], "dépasse les emplacements"))
    # 5. effet récursif (éveil d'un éveil = profondeur > 2)
    def m5(c):
        c["evolutions"].append({"id": "EVO_122", "type": "EVEIL", "sources": ["EVO_113"], "catalyseurs": [],
                                "condition_tardive": "TRF_002"})
    resultats.append(lancer("profondeur de chaîne", m5, [V.verifier_evolutions], "profondeur"))
    # 6. valeur négative
    def m6(c):
        c["personnages"][0]["stats"]["pv"] = -5
    resultats.append(lancer("valeur négative", m6, [lambda c, i, r: V.verifier_valeurs(c, r)], "négative"))
    # 7. technique inaccessible à tous
    def m7(c):
        c["techniques"][0]["acces"] = "KG_JINTON+CLAN_HYUGA"
    resultats.append(lancer("technique inaccessible", m7, [V.verifier_techniques], "inaccessible"))
    # 8. build avec composant non compatible
    def m8(c):
        c["builds"][0]["passifs"][0] = "PAS_046"  # Maître des fils : APT_MARIO
    resultats.append(lancer("composant incompatible", m8, [V.verifier_builds], "inaccessible"))
    # 9. probabilités : l'exemple doit totaliser 100 %
    r = V.Rapport(); V.verifier_probabilites(r)
    ok = not r.erreurs; print(("OK   " if ok else "ÉCHEC") + " somme des probabilités"); resultats.append(ok)
    # 10. migration de sauvegardes anciennes
    v1 = {"version": 1, "ryo": 1200, "persos": ["CHR_001", "CHR_004"], "maitrise": {"CHR_001": 3}, "options": {"flash": True}}
    v3 = migrer(v1)
    ok = v3["version"] == VERSION_COURANTE and "CHR_007" in v3["profil"]["entrees"] and v3["profil"]["ryo"] == 1200 \
        and v3["reglages"]["accessibilite"]["reduire_flashs"] is False
    print(("OK   " if ok else "ÉCHEC") + " migration v1 → v3"); resultats.append(ok)
    print(f"\n{sum(resultats)}/{len(resultats)} tests réussis")
    return 0 if all(resultats) else 1


if __name__ == "__main__":
    sys.exit(main())
