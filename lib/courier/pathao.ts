import {
  CourierProvider,
  CourierShipmentRequest,
  CourierShipmentResult,
  CourierTrackingInfo,
  InternalOrderStatus,
  CourierCity,
  CourierZone,
  CourierArea,
} from "./types";

interface PathaoAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export class PathaoCourierProvider implements CourierProvider {
  name = "Pathao Courier";
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private storeId: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.baseUrl = process.env.PATHAO_API_BASE_URL || "https://courier-api-sandbox.pathao.com";
    this.clientId = process.env.PATHAO_CLIENT_ID || "";
    this.clientSecret = process.env.PATHAO_CLIENT_SECRET || "";
    this.username = process.env.PATHAO_USERNAME || "";
    this.password = process.env.PATHAO_PASSWORD || "";
    this.storeId = process.env.PATHAO_STORE_ID || "1";
  }

  private isConfigured(): boolean {
    return (
      Boolean(this.clientId) &&
      Boolean(this.clientSecret) &&
      Boolean(this.username) &&
      Boolean(this.password) &&
      !this.clientId.includes("placeholder")
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    if (!this.isConfigured()) {
      // In sandbox/demo mode, return a dummy mock token
      return "mock_pathao_access_token_demo_mode";
    }

    try {
      const response = await fetch(`${this.baseUrl}/aladdin/api/v1/issue-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
          grant_type: "password",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Pathao Auth Failed: ${response.status} - ${errText}`);
      }

      const data = (await response.json()) as PathaoAuthResponse;
      this.tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 300) * 1000,
      };

      return data.access_token;
    } catch (error) {
      console.error("[Pathao Auth Error]", error);
      throw error;
    }
  }

  async createShipment(request: CourierShipmentRequest): Promise<CourierShipmentResult> {
    // If not configured with real live keys, simulate high-fidelity Sandbox shipment
    if (!this.isConfigured()) {
      const mockConsignmentId = `PTH-${Date.now().toString().slice(-8)}`;
      return {
        success: true,
        consignmentId: mockConsignmentId,
        trackingCode: `TRACK-${mockConsignmentId}`,
        trackingUrl: `https://pathao.com/courier/tracking/?consignment_id=${mockConsignmentId}`,
        status: "BOOKED",
        deliveryFee: request.recipientAddress.toLowerCase().includes("dhaka") ? 70 : 130,
        message: "Pathao Sandbox shipment booked successfully.",
        rawResponse: {
          code: 200,
          message: "Order successfully created",
          data: {
            consignment_id: mockConsignmentId,
            merchant_order_id: request.merchantOrderId,
            order_status: "Pending",
            delivery_fee: request.recipientAddress.toLowerCase().includes("dhaka") ? 70 : 130,
          },
        },
      };
    }

    try {
      const token = await this.getAccessToken();
      const payload = {
        store_id: parseInt(this.storeId, 10) || 1,
        merchant_order_id: request.merchantOrderId,
        recipient_name: request.recipientName,
        recipient_phone: request.recipientPhone,
        recipient_address: request.recipientAddress,
        recipient_city: request.recipientCityId || 1, // 1 = Dhaka
        recipient_zone: request.recipientZoneId || 1,
        recipient_area: request.recipientAreaId || 1,
        delivery_type: 48, // Normal 48h
        item_type: 2, // 2 = Parcel
        special_instruction: request.specialInstruction || "Handle with care - Electronics",
        item_quantity: request.itemQuantity,
        item_weight: Math.max(0.5, request.itemWeight),
        amount_to_collect: request.amountToCollect,
        item_description: request.itemDescription || "Electronics Goods",
      };

      const res = await fetch(`${this.baseUrl}/aladdin/api/v1/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          consignmentId: "",
          status: "FAILED",
          message: data.message || "Failed to create shipment on Pathao API",
          rawResponse: data,
        };
      }

      const consignmentId = data.data?.consignment_id || `PTH-${Date.now()}`;

      return {
        success: true,
        consignmentId,
        trackingCode: `TRACK-${consignmentId}`,
        trackingUrl: `https://pathao.com/courier/tracking/?consignment_id=${consignmentId}`,
        status: "BOOKED",
        deliveryFee: data.data?.delivery_fee,
        rawResponse: data,
      };
    } catch (error: any) {
      console.error("[Pathao Create Shipment Error]", error);
      return {
        success: false,
        consignmentId: "",
        status: "FAILED",
        message: error.message || "Network error while connecting to Pathao API",
      };
    }
  }

  async getTracking(consignmentId: string): Promise<CourierTrackingInfo> {
    if (!this.isConfigured()) {
      return {
        consignmentId,
        status: "IN_TRANSIT",
        mappedStatus: "IN_TRANSIT",
        currentLocation: "Dhaka Sorting Hub, Tejgaon",
        updatedAt: new Date(),
        history: [
          {
            status: "Order Created",
            message: "Shipment registered with Pathao Courier",
            timestamp: new Date(Date.now() - 3600 * 1000 * 24),
            location: "Merchant Store (Elephant Road)",
          },
          {
            status: "Picked Up",
            message: "Parcel picked up by Pathao Rider",
            timestamp: new Date(Date.now() - 3600 * 1000 * 12),
            location: "Elephant Road Hub",
          },
          {
            status: "In Transit",
            message: "Dispatched to destination sorting hub",
            timestamp: new Date(Date.now() - 3600 * 1000 * 2),
            location: "Dhaka Central Sorting Hub",
          },
        ],
      };
    }

    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      const rawStatus = data.data?.order_status || "Pending";
      const mapped = this.mapPathaoStatusToInternal(rawStatus);

      return {
        consignmentId,
        status: rawStatus,
        mappedStatus: mapped,
        currentLocation: data.data?.current_location || "In Transit",
        updatedAt: new Date(),
        history: (data.data?.status_history || []).map((h: any) => ({
          status: h.status,
          message: h.message || h.status,
          timestamp: new Date(h.timestamp || Date.now()),
          location: h.location,
        })),
      };
    } catch (error) {
      console.error("[Pathao Tracking Error]", error);
      return {
        consignmentId,
        status: "UNKNOWN",
        mappedStatus: "IN_TRANSIT",
        updatedAt: new Date(),
        history: [],
      };
    }
  }

  async cancelShipment(consignmentId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: true, message: "Sandbox shipment cancelled." };
    }

    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/aladdin/api/v1/orders/${consignmentId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason || "Customer requested cancellation" }),
      });

      const data = await res.json();
      return {
        success: res.ok,
        message: data.message || (res.ok ? "Shipment cancelled successfully" : "Failed to cancel shipment"),
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to contact Pathao" };
    }
  }

  async getCities(): Promise<CourierCity[]> {
    return [
      { city_id: 1, city_name: "Dhaka" },
      { city_id: 2, city_name: "Chittagong" },
      { city_id: 3, city_name: "Sylhet" },
      { city_id: 4, city_name: "Rajshahi" },
      { city_id: 5, city_name: "Khulna" },
      { city_id: 6, city_name: "Barishal" },
      { city_id: 7, city_name: "Rangpur" },
      { city_id: 8, city_name: "Mymensingh" },
    ];
  }

  async getZones(cityId: number): Promise<CourierZone[]> {
    if (cityId === 1) {
      return [
        { zone_id: 1, zone_name: "Dhanmondi" },
        { zone_id: 2, zone_name: "Gulshan" },
        { zone_id: 3, zone_name: "Banani" },
        { zone_id: 4, zone_name: "Uttara" },
        { zone_id: 5, zone_name: "Mirpur" },
        { zone_id: 6, zone_name: "Mohammadpur" },
        { zone_id: 7, zone_name: "Elephant Road & New Market" },
        { zone_id: 8, zone_name: "Motijheel" },
      ];
    }
    return [{ zone_id: 101, zone_name: "City Central Zone" }];
  }

  async getAreas(zoneId: number): Promise<CourierArea[]> {
    return [
      { area_id: 1, area_name: "Sector 1 / Road 1-10" },
      { area_id: 2, area_name: "Sector 2 / Road 11-20" },
      { area_id: 3, area_name: "Main Road Market Area" },
    ];
  }

  private mapPathaoStatusToInternal(pathaoStatus: string): InternalOrderStatus {
    const s = (pathaoStatus || "").toLowerCase();
    if (s.includes("pending") || s.includes("created")) return "COURIER_BOOKED";
    if (s.includes("pickup") || s.includes("assigned")) return "PICKED_UP";
    if (s.includes("in transit") || s.includes("hub") || s.includes("dispatched")) return "IN_TRANSIT";
    if (s.includes("out for delivery")) return "OUT_FOR_DELIVERY";
    if (s.includes("delivered") || s.includes("successful")) return "DELIVERED";
    if (s.includes("return") || s.includes("rejected")) return "RETURNED";
    if (s.includes("cancel")) return "CANCELLED";
    return "IN_TRANSIT";
  }
}
