import { formatCurrency } from "./priceCalculator";

interface AvailableUnit {
  id: string;
  name: string;
  pricePerNight: number;
  hasDiscount?: boolean;
  discountedPrice?: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  adultPrice: number;
  childPrice?: number;
  perDay: boolean;
}

interface Promotion {
  minNights: number;
  discountPercentage: number;
  description?: string;
}

export const generateAvailabilityMessage = (
  startDate: string,
  endDate: string,
  nights: number,
  guests: { adults: number; children: number },
  units: AvailableUnit[],
  services: Service[],
  promotions: Promotion[],
  depositPercentage: number
): string => {
  let message = "";

  // Promotions section
  if (promotions.length > 0) {
    promotions.forEach((promo) => {
      message += `✅*${promo.minNights} noches o más ${promo.discountPercentage}% de descuento*\n`;
    });
    message += "\n";
  }

  // Guest info
  const guestText =
    guests.children > 0
      ? `${guests.adults + guests.children} personas (${guests.adults} adultos, ${guests.children} niños)`
      : `${guests.adults} personas`;
  message += `_Para ${guestText}:_\n`;

  // Available units
  units.forEach((unit) => {
    const price = unit.hasDiscount && unit.discountedPrice
      ? formatCurrency(unit.discountedPrice)
      : formatCurrency(unit.pricePerNight);
    
    message += `🟠 ${unit.name} || ${price} / noche`;
    
    if (unit.hasDiscount) {
      message += ` (${promotions[0]?.discountPercentage}% descuento aplicado)`;
    }
    
    message += "\n";
  });

  message += "\n";

  // Services section
  services.forEach((service) => {
    const priceText = service.childPrice
      ? `adultos ${formatCurrency(service.adultPrice)}, niños ${formatCurrency(service.childPrice)}`
      : formatCurrency(service.adultPrice);

    message += `🥐 *${service.name}* (opcional) _${priceText}`;
    message += service.perDay ? " por persona / día_\n" : " por persona_\n";

    if (service.description) {
      message += `${service.description}\n`;
    }
    message += "\n";
  });

  // Important info
  message += `📝 *Modo de reserva*\n`;
  message += `* Depósito: ${depositPercentage}% para confirmar la reserva.\n`;
  message += `* Medios de pago: aceptamos efectivo, transferencias. Tarjetas, QR y link de pago (*10% de recargo*)\n`;

  return message;
};

interface ReservationUnit {
  name: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  hasDiscount: boolean;
  discountPercentage?: number;
}

interface ReservationService {
  name: string;
  adults: number;
  children: number;
  days: number;
  pricePerPerson: number;
  subtotal: number;
}

export const generateReservationMessage = (
  startDate: string,
  endDate: string,
  nights: number,
  guests: { adults: number; children: number },
  units: ReservationUnit[],
  services: ReservationService[],
  total: number,
  deposit: number
): string => {
  let message = "";

  // Date and guest info
  const guestText =
    guests.children > 0
      ? `${nights} noches, ${guests.adults + guests.children} personas (${guests.adults} adultos, ${guests.children} niños)`
      : `${nights} noches, ${guests.adults} personas`;

  message += `${startDate} - ${endDate} (${guestText})\n\n`;

  // Units section
  if (units.length > 0) {
    message += `_Unidades:_\n`;
    units.forEach((unit) => {
      const priceText = formatCurrency(unit.pricePerNight);
      message += `🟠 ${unit.name} || ${priceText} / noche`;
      
      if (unit.hasDiscount && unit.discountPercentage) {
        message += ` (${unit.discountPercentage}% descuento aplicado)`;
      }
      
      message += ` [${formatCurrency(unit.subtotal)}]\n`;
    });
    message += "\n";
  }

  // Services section
  if (services.length > 0) {
    message += `_Servicios:_\n`;
    services.forEach((service) => {
      const guestInfo =
        service.children > 0
          ? `${service.adults + service.children}p${service.days}d`
          : `${service.adults}p${service.days}d`;

      message += `⚪ ${service.name} || ${formatCurrency(service.pricePerPerson)} / persona / día (${guestInfo}) [${formatCurrency(service.subtotal)}]\n`;
    });
    message += "\n";
  }

  // Totals
  message += `*Total:* _${formatCurrency(total)}_\n`;
  message += `*Seña:* _${formatCurrency(deposit)}_\n`;

  return message;
};
