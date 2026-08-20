import { CourierProvider } from "./types";
import { PathaoCourierProvider } from "./pathao";

export * from "./types";
export * from "./pathao";

export function getCourierProvider(providerName: string = "PATHAO"): CourierProvider {
  switch (providerName.toUpperCase()) {
    case "PATHAO":
    default:
      return new PathaoCourierProvider();
  }
}
