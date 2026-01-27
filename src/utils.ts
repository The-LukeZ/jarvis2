import { Colors, ContainerBuilder, TextDisplayBuilder } from "honocord";

/**
 * Calculates reputation points for a trade based on the history of both parties.
 *
 * @param rating - The rating given for the trade (1 to 5)
 * @param totalTradesUser - Total number of all trades by the user (including this one)
 * @param tradesWithPartner - Number of trades with this specific partner (including this one)
 * @returns The points to be awarded (e.g. 0.0 to 10.0)
 *
 * Note that, tradesWithPartner should never exceed totalTradesUser in valid usage.
 */
export function calculateReputation(rating: number, totalTradesUser: number, tradesWithPartner: number): number {
  const BASE_SCORE = 10;
  const RATING_MULTIPLIER = rating / 5.0; // Normalize rating to [0.2, 1.0]

  // Safety check: Prevents division by zero or log(0)
  // We assume the current trade is at least "1" and ensure integer
  const safePartnerTrades = Math.max(1, Math.floor(tradesWithPartner));
  const safeTotalTrades = Math.max(1, Math.floor(totalTradesUser));

  if (safePartnerTrades > safeTotalTrades) {
    throw new TypeError("partner cannot have traded more than the user with the user");
  }

  // 1. DIMINISHING RETURNS (Logarithmic decay)
  const diminishingFactor = 1.0 / (1.0 + Math.log2(safePartnerTrades));

  // 2. FARMING PREVENTION (Linear threshold penalty)
  let concentrationFactor = 1.0;

  // Protection only applies after 4 total trades to avoid blocking beginners
  if (safeTotalTrades > 4) {
    const concentrationRatio = safePartnerTrades / safeTotalTrades;
    const THRESHOLD_START = 0.3; // Penalty begins at 30%
    const THRESHOLD_END = 0.8; // Zero points at 80%

    if (concentrationRatio > THRESHOLD_START) {
      // Calculate linear penalty
      // How far are we above the limit? (e.g. 0.6 - 0.4 = 0.2)
      // Normalize penalty (0.2 / 0.4 = 0.5 penalty)
      const penalty = (concentrationRatio - THRESHOLD_START) / (THRESHOLD_END - THRESHOLD_START);

      // Calculate factor and clamp between 0.0 and 1.0
      concentrationFactor = Math.max(0.0, 1.0 - penalty);
    }
  }

  // Calculate final result
  const finalScore = BASE_SCORE * RATING_MULTIPLIER * diminishingFactor * concentrationFactor;

  // Ceiling for clean database values, we are generous so we ceil instead of flooring
  return Math.ceil(finalScore);
}

export const HiddenFlags = 1 << 6;
export const V2Flags = 1 << 15;
export const HiddenV2Flags = HiddenFlags | V2Flags;

export const SimpleText = (text: string) => new TextDisplayBuilder().setContent(text);

export function buildErrorMessage(message: string) {
  return {
    flags: HiddenV2Flags,
    components: [new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(SimpleText(message))],
  };
}

export function buildSuccessMessage(message: string) {
  return {
    flags: HiddenV2Flags,
    components: [new ContainerBuilder().setAccentColor(Colors.Green).addTextDisplayComponents(SimpleText(message))],
  };
}
