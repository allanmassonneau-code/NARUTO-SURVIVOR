import { describe, expect, it } from 'vitest';
import { addShinobi } from '../src/core/collection';
import { newProfile, SAVE_VERSION } from '../src/core/profile';
import { migrateSave, serializeSave } from '../src/core/save';

describe('sauvegarde', () => {
  it('sérialise puis restaure à l’identique', () => {
    const p = newProfile(1000);
    addShinobi(p, 'gaara', 1000);
    p.currencies.ryo = 4242;
    p.settings.battleSpeed = 2;
    const restored = migrateSave(JSON.parse(serializeSave(p)), 2000);
    expect(restored).toEqual(p);
  });

  it('migre une sauvegarde v1 vers la version courante', () => {
    const v1 = {
      id: 'old',
      username: 'Ancien',
      currencies: { ryo: 10 },
      collection: {},
      lifetime: { battles: 3, wins: 2, legendaries: 0 },
    };
    const p = migrateSave(v1, 0);
    expect(p.saveVersion).toBe(SAVE_VERSION);
    expect(p.username).toBe('Ancien');
    expect(p.currencies).toEqual({ ryo: 10, jade: 50, chainPoints: 0 });
    expect(p.lifetime).toMatchObject({ battles: 3, wins: 2, jutsus: 0, pvpWins: 0 });
    expect(p.pass.seasonId).toBe('s1');
    expect(p.settings.musicVolume).toBe(0.5);
  });

  it('refuse une sauvegarde plus récente ou invalide', () => {
    expect(() => migrateSave({ saveVersion: SAVE_VERSION + 1 }, 0)).toThrow();
    expect(() => migrateSave(null, 0)).toThrow();
    expect(() => migrateSave('texte', 0)).toThrow();
  });
});
