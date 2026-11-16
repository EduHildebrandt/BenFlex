export const CREDIT_SURCHARGE_PERCENT: Record<number, number> = {
  1: 0,
  6: 25,
  12: 45,
};

export interface FinancingBreakdown {
  listPrice: number;
  transferDiscountPercent: number;
  transferPrice: number;
  transferSavings: number;
  onePayment: number;
  sixInstallmentsTotal: number;
  sixInstallmentAmount: number;
  twelveInstallmentsTotal: number;
  twelveInstallmentAmount: number;
}

export function getCreditSurchargePercent(installments?: number): number {
  if (!installments) return 0;
  return CREDIT_SURCHARGE_PERCENT[installments] ?? 0;
}

export function calculateCreditTotal(listPrice: number, installments: number): number {
  const surchargePct = getCreditSurchargePercent(installments);
  return Math.round(listPrice * (1 + surchargePct / 100));
}

export function calculateFinancing(
  listPrice: number,
  transferDiscountPercent: number = 15
): FinancingBreakdown {
  const cleanList = Math.max(0, Math.round(listPrice));
  const cleanDiscount = Math.max(0, Math.min(60, transferDiscountPercent));
  const transferPrice = Math.round(cleanList * (1 - cleanDiscount / 100));
  const sixInstallmentsTotal = calculateCreditTotal(cleanList, 6);
  const twelveInstallmentsTotal = calculateCreditTotal(cleanList, 12);

  return {
    listPrice: cleanList,
    transferDiscountPercent: cleanDiscount,
    transferPrice,
    transferSavings: cleanList - transferPrice,
    onePayment: cleanList,
    sixInstallmentsTotal,
    sixInstallmentAmount: Math.round(sixInstallmentsTotal / 6),
    twelveInstallmentsTotal,
    twelveInstallmentAmount: Math.round(twelveInstallmentsTotal / 12),
  };
}
