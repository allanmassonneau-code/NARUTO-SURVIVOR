/** Événements analytics abstraits. Aucun service réel n'est branché : tampon local visible dans le menu dev. */
export type AnalyticsEvent =
  | 'game_started'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'starter_chosen'
  | 'battle_started'
  | 'battle_won'
  | 'battle_lost'
  | 'pack_received'
  | 'pack_purchased'
  | 'pack_opened'
  | 'legendary_pulled'
  | 'team_changed'
  | 'star_up'
  | 'daily_mission_completed'
  | 'purchase_completed'
  | 'channel_points_redeemed';

export interface AnalyticsRecord {
  event: AnalyticsEvent;
  props: Record<string, unknown>;
  at: number;
}

export interface AnalyticsSink {
  track(event: AnalyticsEvent, props: Record<string, unknown>): void;
}

class BufferedAnalytics implements AnalyticsSink {
  readonly buffer: AnalyticsRecord[] = [];

  track(event: AnalyticsEvent, props: Record<string, unknown>): void {
    this.buffer.push({ event, props, at: Date.now() });
    if (this.buffer.length > 200) this.buffer.shift();
  }
}

export const analytics = new BufferedAnalytics();

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  analytics.track(event, props);
}
