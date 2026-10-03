export interface CosmeticDef {
  id: string;
  kind: 'frame' | 'title';
  name: string;
  /** Cadres : couleur sombre et couleur claire. */
  colors?: [string, string];
  animated?: boolean;
}

const frame = (id: string, name: string, colors: [string, string], animated = false): CosmeticDef => ({
  id,
  kind: 'frame',
  name,
  colors,
  animated,
});
const title = (id: string, name: string): CosmeticDef => ({ id, kind: 'title', name });

/** Cosmétiques : cadres de profil et titres. Purement visuels, jamais de puissance. */
export const COSMETICS: CosmeticDef[] = [
  frame('frame_leaf', 'Cadre Feuille', ['#2f6a2f', '#8fd46a']),
  frame('frame_sand', 'Cadre Sable', ['#8a6230', '#f0d890']),
  frame('frame_lightning', 'Cadre Éclair', ['#1c4a9a', '#9ad8ff']),
  frame('frame_moon', 'Cadre Lune rouge', ['#5a0e1c', '#f05038']),
  frame('frame_gold', 'Cadre Éveil', ['#9a6a10', '#ffe08a'], true),
  frame('frame_toad', 'Cadre Myôboku', ['#8a2a20', '#f0b060']),
  title('title_genin', 'Genin prometteur'),
  title('title_chunin', 'Chûnin'),
  title('title_elite', 'Ninja d’élite'),
  title('title_sannin', 'Sannin légendaire'),
  title('title_kage_s1', 'Kage de la Saison 1'),
  title('title_centurion', 'Centurion'),
  title('title_archivist', 'Archiviste'),
  title('title_valley', 'Légende de la Vallée'),
  title('title_gold', 'Challenger d’Or'),
  title('title_mist_breaker', 'Briseur de brume'),
  title('title_akatsuki_hunter', 'Chasseur d’Akatsuki'),
];

export const COSMETICS_BY_ID: Record<string, CosmeticDef> = Object.fromEntries(COSMETICS.map((c) => [c.id, c]));
