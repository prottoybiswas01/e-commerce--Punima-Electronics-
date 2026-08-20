import prisma from "@/lib/prisma";

export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findFirst();
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        id: "default",
        shopName: "Purnima Electronics",
        phone: "+880 1712-345678",
        email: "sales@purnimaelectronics.com",
        address: "Shop #12, Level 3, Multiplan Center, New Elephant Road, Dhaka-1205, Bangladesh",
        businessHours: "Saturday - Thursday: 10:00 AM - 8:30 PM (Friday Closed)",
        currency: "BDT",
        currencySymbol: "৳",
        defaultDeliveryInsideDhaka: 70,
        defaultDeliveryOutsideDhaka: 130,
        freeShippingThreshold: 5000,
        metaTitle: "Purnima Electronics | Genuine Gadgets, Appliances & Tech in Bangladesh",
        metaDescription: "Buy authentic smartphones, laptops, smart TVs, home appliances and audio gear with official warranty and fast delivery across Bangladesh.",
      },
    });
  }
  return settings;
}
