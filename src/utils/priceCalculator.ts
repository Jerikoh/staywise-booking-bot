import { differenceInDays, parseISO, isWithinInterval } from "date-fns";

interface TariffPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  degree: "first" | "second";
  deposit_percentage: number;
}

interface UnitPrice {
  unit_id: string;
  tariff_period_id: string;
  price_per_night: number;
}

interface Promotion {
  min_nights: number;
  discount_percentage: number;
  tariff_period_id: string | null;
}

interface ServicePrice {
  service_id: string;
  tariff_period_id: string;
  adult_price: number;
  child_price: number | null;
  per_day: boolean;
}

export const calculateStayPrice = (
  startDate: string,
  endDate: string,
  unitId: string,
  unitPrices: UnitPrice[],
  periods: TariffPeriod[]
): { total: number; breakdown: { periodName: string; nights: number; pricePerNight: number; subtotal: number }[] } => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const totalNights = differenceInDays(end, start);

  const breakdown: { periodName: string; nights: number; pricePerNight: number; subtotal: number }[] = [];
  
  // Sort periods by degree (first priority first)
  const sortedPeriods = [...periods].sort((a, b) => {
    if (a.degree === "first" && b.degree === "second") return -1;
    if (a.degree === "second" && b.degree === "first") return 1;
    return 0;
  });

  let currentDate = start;
  let total = 0;

  while (currentDate < end) {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find applicable period (first degree takes priority)
    const applicablePeriod = sortedPeriods.find((period) =>
      isWithinInterval(currentDate, {
        start: parseISO(period.start_date),
        end: parseISO(period.end_date),
      })
    );

    if (applicablePeriod) {
      const unitPrice = unitPrices.find(
        (up) => up.unit_id === unitId && up.tariff_period_id === applicablePeriod.id
      );

      if (unitPrice) {
        const existingBreakdown = breakdown.find(
          (b) => b.periodName === applicablePeriod.name
        );

        if (existingBreakdown) {
          existingBreakdown.nights += 1;
          existingBreakdown.subtotal += unitPrice.price_per_night;
        } else {
          breakdown.push({
            periodName: applicablePeriod.name,
            nights: 1,
            pricePerNight: unitPrice.price_per_night,
            subtotal: unitPrice.price_per_night,
          });
        }

        total += unitPrice.price_per_night;
      }
    }

    currentDate = nextDay;
  }

  return { total, breakdown };
};

export const calculatePromotion = (
  nights: number,
  promotions: Promotion[],
  tariffPeriodId?: string
): { discount: number; percentage: number; description: string } | null => {
  const applicablePromotions = promotions.filter(
    (p) =>
      nights >= p.min_nights &&
      (!p.tariff_period_id || p.tariff_period_id === tariffPeriodId)
  );

  if (applicablePromotions.length === 0) return null;

  // Get the best promotion (highest discount for lowest nights requirement)
  const bestPromotion = applicablePromotions.reduce((best, current) =>
    current.discount_percentage > best.discount_percentage ? current : best
  );

  return {
    discount: 0, // Will be calculated on total
    percentage: bestPromotion.discount_percentage,
    description: `${bestPromotion.min_nights} noches o más: ${bestPromotion.discount_percentage}% de descuento`,
  };
};

export const calculateServicePrice = (
  adults: number,
  children: number,
  days: number,
  servicePrice: ServicePrice
): number => {
  const adultTotal = adults * servicePrice.adult_price;
  const childTotal = children * (servicePrice.child_price || servicePrice.adult_price);
  const dailyTotal = adultTotal + childTotal;

  return servicePrice.per_day ? dailyTotal * days : dailyTotal;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("es-AR")}`;
};
