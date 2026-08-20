export type InternalOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "COURIER_BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export interface CourierShipmentRequest {
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCityId?: number;
  recipientZoneId?: number;
  recipientAreaId?: number;
  deliveryType?: "48_HOURS" | "NEXT_DAY" | "SAME_DAY";
  itemType?: "DOCUMENTS" | "PARCEL";
  specialInstruction?: string;
  itemQuantity: number;
  itemWeight: number; // in KG
  amountToCollect: number; // COD amount in BDT
  itemDescription?: string;
}

export interface CourierShipmentResult {
  success: boolean;
  consignmentId: string;
  trackingCode?: string;
  trackingUrl?: string;
  status: string;
  deliveryFee?: number;
  message?: string;
  rawResponse?: unknown;
}

export interface CourierTrackingInfo {
  consignmentId: string;
  status: string;
  mappedStatus: InternalOrderStatus;
  currentLocation?: string;
  updatedAt: Date;
  history: Array<{
    status: string;
    message: string;
    timestamp: Date;
    location?: string;
  }>;
}

export interface CourierCity {
  city_id: number;
  city_name: string;
}

export interface CourierZone {
  zone_id: number;
  zone_name: string;
}

export interface CourierArea {
  area_id: number;
  area_name: string;
}

export interface CourierProvider {
  name: string;
  createShipment(request: CourierShipmentRequest): Promise<CourierShipmentResult>;
  getTracking(consignmentId: string): Promise<CourierTrackingInfo>;
  cancelShipment(consignmentId: string, reason?: string): Promise<{ success: boolean; message: string }>;
  getCities(): Promise<CourierCity[]>;
  getZones(cityId: number): Promise<CourierZone[]>;
  getAreas(zoneId: number): Promise<CourierArea[]>;
}
