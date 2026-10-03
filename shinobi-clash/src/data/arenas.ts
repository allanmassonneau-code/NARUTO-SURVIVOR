import type { AiLevel, Reward, TeamMemberSpec } from '../core/types';

export interface StageDef {
  id: string;
  name: string;
  enemyName: string;
  enemy: TeamMemberSpec[];
  ai: AiLevel;
  xp: number;
  reward: Reward;
  firstClear: Reward;
}

export interface ArenaDef {
  id: string;
  name: string;
  subtitle: string;
  /** Décor de combat (voir game/gfx/backgrounds). */
  bg: string;
  stages: StageDef[];
}

const enemy = (defId: string, level: number, stars = 1): TeamMemberSpec => ({ defId, level, stars });

/** Aventure PvE : arènes de difficulté croissante, chacune débloquée par la précédente. */
export const ARENAS: ArenaDef[] = [
  {
    id: 'academy',
    name: 'Académie',
    subtitle: 'Les bases du combat',
    bg: 'academy',
    stages: [
      {
        id: 'academy_1',
        name: 'Premier duel',
        enemyName: 'Élève rival',
        enemy: [enemy('academy_student', 1)],
        ai: 'easy',
        xp: 50,
        reward: { currencies: { ryo: 120 } },
        firstClear: { packs: { starter: 1 } },
      },
      {
        id: 'academy_2',
        name: 'Examen pratique',
        enemyName: 'Classe B',
        enemy: [enemy('hinata', 1), enemy('sakura', 1), enemy('rock_lee', 1)],
        ai: 'easy',
        xp: 60,
        reward: { currencies: { ryo: 150 } },
        firstClear: { currencies: { ryo: 400 } },
      },
      {
        id: 'academy_3',
        name: 'Diplôme',
        enemyName: 'Iruka (simulation)',
        enemy: [enemy('shikamaru', 2), enemy('sakura', 2), enemy('temari', 2)],
        ai: 'normal',
        xp: 90,
        reward: { currencies: { ryo: 180 } },
        firstClear: { packs: { standard: 1 } },
      },
    ],
  },
  {
    id: 'forest',
    name: 'Forêt de la Mort',
    subtitle: 'Survivre aux embuscades',
    bg: 'forest',
    stages: [
      {
        id: 'forest_1',
        name: 'Embuscade',
        enemyName: 'Ninjas du Son',
        enemy: [enemy('temari', 2), enemy('rock_lee', 3), enemy('hinata', 2)],
        ai: 'normal',
        xp: 100,
        reward: { currencies: { ryo: 200 } },
        firstClear: { currencies: { jade: 20 } },
      },
      {
        id: 'forest_2',
        name: 'Rouleaux convoités',
        enemyName: 'Équipe de Kiri',
        enemy: [enemy('kisame', 6), enemy('hinata', 5), enemy('neji', 6)],
        ai: 'normal',
        xp: 140,
        reward: { currencies: { ryo: 220 } },
        firstClear: { currencies: { ryo: 600 } },
      },
      {
        id: 'forest_3',
        name: 'La tour',
        enemyName: 'Équipe Gai',
        enemy: [enemy('rock_lee', 5), enemy('neji', 6), enemy('temari', 5)],
        ai: 'normal',
        xp: 160,
        reward: { currencies: { ryo: 260 } },
        firstClear: { packs: { standard: 1 } },
      },
    ],
  },
  {
    id: 'exam',
    name: 'Examen Chûnin',
    subtitle: 'Le tournoi final',
    bg: 'exam',
    stages: [
      {
        id: 'exam_1',
        name: 'Préliminaires',
        enemyName: 'Équipe 10',
        enemy: [enemy('ino', 6), enemy('shikamaru', 7), enemy('choji', 6)],
        ai: 'normal',
        xp: 180,
        reward: { currencies: { ryo: 280 } },
        firstClear: { currencies: { jade: 25 } },
      },
      {
        id: 'exam_2',
        name: 'Hyûga contre Hyûga',
        enemyName: 'Clan Hyûga',
        enemy: [enemy('neji', 7), enemy('hinata', 7), enemy('rock_lee', 7)],
        ai: 'normal',
        xp: 200,
        reward: { currencies: { ryo: 300 } },
        firstClear: { currencies: { ryo: 800 } },
      },
      {
        id: 'exam_3',
        name: 'Finale',
        enemyName: 'Sasuke & co',
        enemy: [enemy('sasuke', 10), enemy('naruto', 10), enemy('sakura', 10)],
        ai: 'hard',
        xp: 220,
        reward: { currencies: { ryo: 340 } },
        firstClear: { packs: { elite: 1 } },
      },
    ],
  },
  {
    id: 'desert',
    name: 'Désert de Suna',
    subtitle: 'Le sable ne pardonne pas',
    bg: 'desert',
    stages: [
      {
        id: 'desert_1',
        name: 'Tempête de sable',
        enemyName: 'Fratrie de Suna',
        enemy: [enemy('temari', 11), enemy('gaara', 11), enemy('kankuro', 11)],
        ai: 'normal',
        xp: 240,
        reward: { currencies: { ryo: 360 } },
        firstClear: { currencies: { jade: 30 } },
      },
      {
        id: 'desert_2',
        name: 'Défense du village',
        enemyName: 'Garde de Suna',
        enemy: [enemy('gaara', 10), enemy('kisame', 9), enemy('temari', 10)],
        ai: 'normal',
        xp: 260,
        reward: { currencies: { ryo: 380 } },
        firstClear: { currencies: { ryo: 1000 } },
      },
      {
        id: 'desert_3',
        name: 'Le Kazekage',
        enemyName: 'Gaara du Désert',
        enemy: [enemy('gaara', 12, 2), enemy('temari', 11), enemy('kakashi', 10)],
        ai: 'hard',
        xp: 280,
        reward: { currencies: { ryo: 420 } },
        firstClear: { packs: { elite: 1 } },
      },
    ],
  },
  {
    id: 'valley',
    name: 'Vallée de la Fin',
    subtitle: "L'affrontement ultime",
    bg: 'valley',
    stages: [
      {
        id: 'valley_1',
        name: 'Poursuite',
        enemyName: 'Akatsuki',
        enemy: [enemy('kisame', 14), enemy('itachi', 14), enemy('neji', 14)],
        ai: 'normal',
        xp: 300,
        reward: { currencies: { ryo: 450 } },
        firstClear: { currencies: { jade: 40 } },
      },
      {
        id: 'valley_2',
        name: 'Le Ninja Copieur',
        enemyName: 'Kakashi',
        enemy: [enemy('kakashi', 17, 2), enemy('sakura', 17), enemy('naruto', 17)],
        ai: 'hard',
        xp: 330,
        reward: { currencies: { ryo: 480 } },
        firstClear: { currencies: { ryo: 1500 } },
      },
      {
        id: 'valley_3',
        name: 'Vallée de la Fin',
        enemyName: 'Rivaux éternels',
        enemy: [enemy('sasuke', 17), enemy('itachi', 16), enemy('naruto', 17)],
        ai: 'hard',
        xp: 360,
        reward: { currencies: { ryo: 550 } },
        firstClear: { packs: { elite: 2 }, currencies: { jade: 100 } },
      },
    ],
  },
  {
    id: 'wave',
    name: 'Pays des Vagues',
    subtitle: 'Le pont dans la brume',
    bg: 'mist',
    stages: [
      {
        id: 'wave_1',
        name: 'Brume épaisse',
        enemyName: 'Chasseur de la Brume',
        enemy: [enemy('haku', 20), enemy('kankuro', 19), enemy('kiba', 20)],
        ai: 'normal',
        xp: 380,
        reward: { currencies: { ryo: 600 } },
        firstClear: { currencies: { jade: 40 } },
      },
      {
        id: 'wave_2',
        name: 'Les miroirs de glace',
        enemyName: 'Haku',
        enemy: [enemy('haku', 22, 2), enemy('ino', 21), enemy('choji', 22)],
        ai: 'normal',
        xp: 400,
        reward: { currencies: { ryo: 640 } },
        firstClear: { currencies: { ryo: 1800 } },
      },
      {
        id: 'wave_3',
        name: 'Le Démon de la Brume',
        enemyName: 'Zabuza',
        enemy: [enemy('zabuza', 23, 2), enemy('haku', 22), enemy('kisame', 22)],
        ai: 'hard',
        xp: 420,
        reward: { currencies: { ryo: 680 } },
        firstClear: {
          packs: { elite: 1 },
          cosmetics: ['title_mist_breaker'],
        },
      },
    ],
  },
  {
    id: 'akatsuki',
    name: 'Repaire de l’Akatsuki',
    subtitle: 'Les déserteurs de rang S',
    bg: 'hideout',
    stages: [
      {
        id: 'akatsuki_1',
        name: 'Art explosif',
        enemyName: 'Deidara',
        enemy: [enemy('deidara', 24), enemy('kankuro', 24), enemy('kisame', 23)],
        ai: 'normal',
        xp: 440,
        reward: { currencies: { ryo: 720 } },
        firstClear: { currencies: { jade: 50 } },
      },
      {
        id: 'akatsuki_2',
        name: 'L’Ermite des crapauds',
        enemyName: 'Jiraiya',
        enemy: [enemy('jiraiya', 24), enemy('naruto', 22), enemy('kakashi', 21)],
        ai: 'hard',
        xp: 460,
        reward: { currencies: { ryo: 760 } },
        firstClear: { currencies: { jade: 60 }, cosmetics: ['frame_toad'] },
      },
      {
        id: 'akatsuki_3',
        name: 'Lune rouge',
        enemyName: 'Akatsuki',
        enemy: [enemy('itachi', 26, 2), enemy('deidara', 26), enemy('kisame', 25)],
        ai: 'hard',
        xp: 500,
        reward: { currencies: { ryo: 800 } },
        firstClear: {
          packs: { elite: 2 },
          currencies: { jade: 100 },
          cosmetics: ['title_akatsuki_hunter'],
        },
      },
    ],
  },
];

export type StageWithArena = StageDef & { arenaId: string; index: number };

export const STAGES: Record<string, StageWithArena> = Object.fromEntries(
  ARENAS.flatMap((a) => a.stages.map((s, index) => [s.id, { ...s, arenaId: a.id, index }])),
);

/** Ordre de progression de toutes les étapes. */
export const STAGE_ORDER: string[] = ARENAS.flatMap((a) => a.stages.map((s) => s.id));
