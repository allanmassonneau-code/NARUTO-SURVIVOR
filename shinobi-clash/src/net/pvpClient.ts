import type { TeamMemberSpec } from '../core/types';
import { decode, encode, PVP_PORT, type ClientMessage, type LeaderboardEntry, type ServerMessage } from './protocol';

export type ConnectionStatus = 'offline' | 'connecting' | 'online' | 'reconnecting';

const PLAYER_ID_KEY = 'shinobi-clash-pvp-id';

function serverUrl(): string {
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname || 'localhost'}:${PVP_PORT}`;
}

/**
 * Connexion au serveur PvP : poignée de main, battement de cœur, reconnexion automatique pendant un
 * match (le serveur garde la place quelques secondes avant de déclarer forfait).
 */
class PvpClient {
  static readonly STALE_MS = 15000;

  status: ConnectionStatus = 'offline';
  mmr = 1000;
  inMatch = false;
  readonly url = serverUrl();
  private ws: WebSocket | null = null;
  private listeners = new Set<(m: ServerMessage) => void>();
  private statusListeners = new Set<(s: ConnectionStatus) => void>();
  private hello: { name: string; team: TeamMemberSpec[] } | null = null;
  private reconnectUntil = 0;
  private lastMessageAt = 0;
  private heartbeat: number | null = null;
  private reconnecting = false;

  get playerId(): string | null {
    try {
      return localStorage.getItem(PLAYER_ID_KEY);
    } catch {
      return null;
    }
  }

  set playerId(id: string | null) {
    try {
      if (id) localStorage.setItem(PLAYER_ID_KEY, id);
    } catch {
      // Stockage indisponible : un nouvel identifiant sera attribué à chaque session.
    }
  }

  get httpUrl(): string {
    return this.url.replace(/^ws/, 'http');
  }

  on(listener: (m: ServerMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(listener: (s: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }

  private startHeartbeat(ws: WebSocket): void {
    this.stopHeartbeat();
    this.heartbeat = window.setInterval(() => {
      if (this.ws !== ws) return this.stopHeartbeat();
      if (Date.now() - this.lastMessageAt > PvpClient.STALE_MS) return this.drop(ws, true);
      this.send({ t: 'ping' });
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  private drop(ws: WebSocket, unexpected: boolean): void {
    if (this.ws !== ws) return;
    this.stopHeartbeat();
    this.ws = null;
    try {
      ws.close();
    } catch {
      // Déjà fermée.
    }
    if (unexpected && this.inMatch) void this.reconnect();
    else if (!this.reconnecting) this.setStatus('offline');
  }

  connect(name: string, team: TeamMemberSpec[]): Promise<void> {
    this.hello = { name, team };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (Date.now() - this.lastMessageAt <= PvpClient.STALE_MS) {
        this.send({ t: 'hello', playerId: this.playerId ?? undefined, name, team });
        return Promise.resolve();
      }
      this.drop(this.ws, false);
    }
    this.setStatus(this.reconnecting ? 'reconnecting' : 'connecting');
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(this.url);
      } catch (e) {
        this.setStatus('offline');
        reject(e instanceof Error ? e : Error(String(e)));
        return;
      }
      this.ws = ws;
      const timeout = setTimeout(() => {
        ws.close();
        reject(Error('Serveur injoignable'));
      }, 4000);
      ws.onopen = () => {
        this.lastMessageAt = Date.now();
        ws.send(encode({ t: 'hello', playerId: this.playerId ?? undefined, name, team }));
        this.startHeartbeat(ws);
      };
      ws.onmessage = (event) => {
        this.lastMessageAt = Date.now();
        const message = decode<ServerMessage>(String(event.data));
        if (!message || message.t === 'pong') return;
        if (message.t === 'welcome') {
          clearTimeout(timeout);
          this.playerId = message.playerId;
          this.mmr = message.mmr;
          this.setStatus('online');
          resolve();
        }
        if (message.t === 'matchFound') this.inMatch = true;
        if (message.t === 'end') this.inMatch = false;
        for (const listener of this.listeners) listener(message);
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(Error('Serveur injoignable'));
      };
      ws.onclose = () => {
        clearTimeout(timeout);
        reject(Error('Connexion fermée'));
        this.drop(ws, true);
      };
    });
  }

  /** Tente de revenir pendant 20 s ; le serveur renvoie alors l'état du match en cours. */
  private async reconnect(): Promise<void> {
    if (!this.hello || this.reconnecting) return;
    this.reconnecting = true;
    this.setStatus('reconnecting');
    this.reconnectUntil = Date.now() + 20000;
    try {
      while (Date.now() < this.reconnectUntil) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          await this.connect(this.hello.name, this.hello.team);
          return;
        } catch {
          // Nouvel essai au prochain tour de boucle.
        }
      }
      this.inMatch = false;
      this.setStatus('offline');
    } finally {
      this.reconnecting = false;
    }
  }

  send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(encode(message));
  }

  disconnect(): void {
    this.inMatch = false;
    if (this.ws) this.drop(this.ws, false);
    this.setStatus('offline');
  }

  async leaderboard(): Promise<LeaderboardEntry[] | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${this.httpUrl}/leaderboard`, { signal: controller.signal });
      clearTimeout(timer);
      return res.ok ? ((await res.json()) as LeaderboardEntry[]) : null;
    } catch {
      return null;
    }
  }
}

export type { PvpClient };
export const pvp = new PvpClient();
