export enum ConfidenceCheckResult {
  CAR_LIKELY = 'car likely',
  MAYBE_A_CAR = 'maybe a car',
  PROBABLY_NOT_A_CAR = 'probably not a car',
  TIRE_LIKELY = 'tire likely',
  MAYBE_A_TIRE = 'maybe a tire',
  PROBABLY_NOT_A_TIRE = 'probably not a tire',
}

export const makeConfidenceChecker = (threshold: number, objectType: 'car' | 'wheel'): ConfidenceCheckResult => {
    if (threshold >= 0.75) {
        return objectType === 'car' ? ConfidenceCheckResult.CAR_LIKELY : ConfidenceCheckResult.TIRE_LIKELY;
    }
    if (threshold >= 0.5) {
        return objectType === 'car' ? ConfidenceCheckResult.MAYBE_A_CAR : ConfidenceCheckResult.MAYBE_A_TIRE;
    }
    return objectType === 'car' ? ConfidenceCheckResult.PROBABLY_NOT_A_CAR : ConfidenceCheckResult.PROBABLY_NOT_A_TIRE;
}