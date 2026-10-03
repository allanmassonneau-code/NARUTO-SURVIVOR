/** Stockage de la sauvegarde : localStorage aujourd'hui, API demain. */
export interface SaveRepository {
  load(): Promise<string | null>;
  save(data: string): Promise<void>;
  clear(): Promise<void>;
}

export class LocalStorageRepository implements SaveRepository {
  constructor(private readonly key = 'shinobi-clash-save') {}

  async load(): Promise<string | null> {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  async save(data: string): Promise<void> {
    try {
      localStorage.setItem(this.key, data);
      localStorage.setItem(`${this.key}-backup`, data);
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.key);
      localStorage.removeItem(`${this.key}-backup`);
    } catch {
      // Stockage indisponible (navigation privée) : rien à effacer.
    }
  }
}
