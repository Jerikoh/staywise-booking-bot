import { formatCurrency } from "./priceCalculator";
import { supabase } from "@/integrations/supabase/client";

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

interface MessageTemplates {
  [key: string]: string;
}

const replaceVariables = (template: string, variables: Record<string, any>): string => {
  let result = template;
  Object.keys(variables).forEach((key) => {
    const value = variables[key] ?? "";
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  });
  return result;
};

const getTemplates = async (): Promise<MessageTemplates> => {
  const { data, error } = await supabase
    .from("message_templates")
    .select("template_type, content");
  
  if (error) throw error;
  
  const templates: MessageTemplates = {};
  data?.forEach((t) => {
    templates[t.template_type] = t.content;
  });
  
  return templates;
};

export const generateAvailabilityMessage = async (
  startDate: string,
  endDate: string,
  nights: number,
  guests: { adults: number; children: number },
  units: AvailableUnit[],
  services: Service[],
  promotions: Promotion[],
  depositPercentage: number
): Promise<string> => {
  const templates = await getTemplates();
  let message = "";

  // Promotions section
  if (promotions.length > 0) {
    promotions.forEach((promo) => {
      message += replaceVariables(templates.availability_header, {
        minNights: promo.minNights,
        discountPercentage: promo.discountPercentage,
      }) + "\n";
    });
    message += "\n";
  }

  // Guest info
  const guestText =
    guests.children > 0
      ? `${guests.adults + guests.children} personas (${guests.adults} adultos, ${guests.children} niños)`
      : `${guests.adults} personas`;
  
  message += replaceVariables(templates.availability_guest_info, { guestText }) + "\n";

  // Available units
  units.forEach((unit) => {
    const price = unit.hasDiscount && unit.discountedPrice
      ? formatCurrency(unit.discountedPrice)
      : formatCurrency(unit.pricePerNight);
    
    const templateKey = unit.hasDiscount ? "availability_unit_discount" : "availability_unit";
    message += replaceVariables(templates[templateKey], {
      unitName: unit.name,
      price,
      discountPercentage: promotions[0]?.discountPercentage || 0,
    }) + "\n";
  });

  message += "\n";

  // Services section
  services.forEach((service) => {
    const priceText = service.childPrice
      ? `adultos ${formatCurrency(service.adultPrice)}, niños ${formatCurrency(service.childPrice)}`
      : formatCurrency(service.adultPrice);

    const perDayText = service.perDay ? " por persona / día" : " por persona";

    message += replaceVariables(templates.availability_service, {
      serviceName: service.name,
      priceText,
      perDayText,
    }) + "\n";

    if (service.description) {
      message += `${service.description}\n`;
    }
    message += "\n";
  });

  // Footer
  message += replaceVariables(templates.availability_footer, {
    depositPercentage,
  }) + "\n";

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

export const generateReservationMessage = async (
  startDate: string,
  endDate: string,
  nights: number,
  guests: { adults: number; children: number },
  units: ReservationUnit[],
  services: ReservationService[],
  total: number,
  deposit: number
): Promise<string> => {
  const templates = await getTemplates();
  let message = "";

  // Date and guest info
  const guestText =
    guests.children > 0
      ? `${nights} noches, ${guests.adults + guests.children} personas (${guests.adults} adultos, ${guests.children} niños)`
      : `${nights} noches, ${guests.adults} personas`;

  message += replaceVariables(templates.reservation_header, {
    startDate,
    endDate,
    guestText,
  }) + "\n\n";

  // Units section
  if (units.length > 0) {
    message += templates.reservation_units_title + "\n";
    units.forEach((unit) => {
      const templateKey = unit.hasDiscount && unit.discountPercentage 
        ? "reservation_unit_discount" 
        : "reservation_unit";
      
      message += replaceVariables(templates[templateKey], {
        unitName: unit.name,
        pricePerNight: formatCurrency(unit.pricePerNight),
        subtotal: formatCurrency(unit.subtotal),
        discountPercentage: unit.discountPercentage || 0,
      }) + "\n";
    });
    message += "\n";
  }

  // Services section
  if (services.length > 0) {
    message += templates.reservation_services_title + "\n";
    services.forEach((service) => {
      const guestInfo =
        service.children > 0
          ? `${service.adults + service.children}p${service.days}d`
          : `${service.adults}p${service.days}d`;

      message += replaceVariables(templates.reservation_service, {
        serviceName: service.name,
        pricePerPerson: formatCurrency(service.pricePerPerson),
        guestInfo,
        subtotal: formatCurrency(service.subtotal),
      }) + "\n";
    });
    message += "\n";
  }

  // Totals
  message += replaceVariables(templates.reservation_total, {
    total: formatCurrency(total),
  }) + "\n";
  
  message += replaceVariables(templates.reservation_deposit, {
    deposit: formatCurrency(deposit),
  }) + "\n";

  return message;
};
