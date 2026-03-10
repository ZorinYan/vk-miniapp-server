export type SubscriptionDuration = 1 | 3 | 6 | 12;

export interface SubscriptionState {
    months: SubscriptionDuration;
    groupSessions: number;
    personalSessions: number;
}