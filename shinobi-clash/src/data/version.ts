/**
 * Version du contenu de combat (statistiques, jutsus, passifs, formule).
 * À incrémenter à chaque changement d'équilibrage : un replay ne se rejoue à l'identique qu'avec les
 * mêmes données, donc les replays d'une autre version sont signalés au lieu d'afficher un faux combat.
 */
export const CONTENT_VERSION = 2;
