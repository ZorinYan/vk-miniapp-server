import { SubscriptionDuration } from "../types/subscription";

const groupPrice = 550;
const personalPrice = 1500;

const durationCoefficient: Record<SubscriptionDuration, number> = {
    1: 1,
    3: 0.92,
    6: 0.85,
    12: 0.75
};

export function calculatePrice(
    group: number,
    personal: number,
    months: SubscriptionDuration
): number {

    const base = group * groupPrice + personal * personalPrice;

    const total = base * durationCoefficient[months];

    return Math.round(total);
}