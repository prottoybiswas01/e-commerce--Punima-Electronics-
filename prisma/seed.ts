import { PrismaClient } from "@prisma/client";
import { SYSTEM_ROLES } from "../lib/auth/roles";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Purnima Electronics database...");

  // 1. Clear existing records safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.courierEvent.deleteMany();
  await prisma.courierShipment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  // 2. Seed Store Settings
  await prisma.storeSettings.create({
    data: {
      shopName: "Purnima Electronics",
      logoUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=80",
      phone: "+880 1712-345678",
      email: "support@purnimaelectronics.com",
      address: "Shop #12, Level 3, Multiplan Center, New Elephant Road, Dhaka-1205, Bangladesh",
      businessHours: "Saturday - Thursday: 10:00 AM - 8:30 PM (Friday Closed)",
      currency: "BDT",
      currencySymbol: "৳",
      defaultDeliveryInsideDhaka: 70,
      defaultDeliveryOutsideDhaka: 130,
      freeShippingThreshold: 5000,
      returnPolicy: "7 Days Easy Replacement for manufacturing defects. Products must be in original condition with box intact.",
      shippingPolicy: "Same day dispatch inside Dhaka (24-48 hours delivery). 48-72 hours delivery across all 64 districts via Pathao Courier.",
      privacyPolicy: "We value customer privacy and encrypt all transaction and customer data.",
      termsConditions: "Official warranty claims require the original invoice provided with order.",
      socialFacebook: "https://facebook.com",
      socialInstagram: "https://instagram.com",
      socialYoutube: "https://youtube.com",
      metaTitle: "Purnima Electronics | Authentic Gadgets, 4K TVs & Appliances in Bangladesh",
      metaDescription: "Best prices on official Samsung, Apple, Sony, LG and Walton electronics with Cash on Delivery nationwide.",
    },
  });

  // 3. Seed Roles and Permissions
  for (const [roleKey, roleDef] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.create({
      data: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
      },
    });

    for (const permKey of roleDef.permissions) {
      let perm = await prisma.permission.findUnique({ where: { key: permKey } });
      if (!perm) {
        perm = await prisma.permission.create({
          data: {
            key: permKey,
            name: permKey.replace(/_/g, " ").toUpperCase(),
            category: permKey.split("_")[1]?.toUpperCase() || "GENERAL",
          },
        });
      }

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 4. Seed Admin Master Account
  const superAdminRole = await prisma.role.findFirst({ where: { name: "Super Admin" } });
  const adminUserRecord = await prisma.user.create({
    data: {
      name: "Shop Owner (Super Admin)",
      email: "owner@purnimaelectronics.com",
      phone: "01700000001",
      role: "SUPER_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
  });

  if (superAdminRole) {
    await prisma.adminUser.create({
      data: {
        userId: adminUserRecord.id,
        name: "Shop Owner",
        email: "owner@purnimaelectronics.com",
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
  }

  // 5. Seed Categories
  const catTV = await prisma.category.create({
    data: {
      name: "Smart TVs & Audio",
      slug: "smart-tvs-audio",
      description: "4K OLED, QLED, Soundbars and Home Theater systems",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=80",
      icon: "Tv",
      isFeatured: true,
      displayOrder: 1,
    },
  });

  const catPhones = await prisma.category.create({
    data: {
      name: "Smartphones & Tablets",
      slug: "smartphones-tablets",
      description: "Flagship and mid-range mobile devices with official warranty",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
      icon: "Smartphone",
      isFeatured: true,
      displayOrder: 2,
    },
  });

  const catAppliances = await prisma.category.create({
    data: {
      name: "Home Appliances",
      slug: "home-appliances",
      description: "Refrigerators, Microwave Ovens, Washing Machines and Blenders",
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80",
      icon: "Refrigerator",
      isFeatured: true,
      displayOrder: 3,
    },
  });

  const catAC = await prisma.category.create({
    data: {
      name: "Air Conditioners",
      slug: "air-conditioners",
      description: "Energy saving Inverter split ACs from 1 Ton to 2.5 Ton",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80",
      icon: "Wind",
      isFeatured: true,
      displayOrder: 4,
    },
  });

  const catComputing = await prisma.category.create({
    data: {
      name: "Laptops & Computing",
      slug: "laptops-computing",
      description: "Business laptops, gaming rigs and tech peripherals",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80",
      icon: "Laptop",
      isFeatured: true,
      displayOrder: 5,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "Noise cancelling headphones, bluetooth speakers and earbuds",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      icon: "Headphones",
      isFeatured: true,
      displayOrder: 6,
    },
  });

  // 6. Seed Brands
  const brandSamsung = await prisma.brand.create({
    data: { name: "Samsung", slug: "samsung", isFeatured: true },
  });
  const brandApple = await prisma.brand.create({
    data: { name: "Apple", slug: "apple", isFeatured: true },
  });
  const brandSony = await prisma.brand.create({
    data: { name: "Sony", slug: "sony", isFeatured: true },
  });
  const brandLG = await prisma.brand.create({
    data: { name: "LG", slug: "lg", isFeatured: true },
  });
  const brandWalton = await prisma.brand.create({
    data: { name: "Walton", slug: "walton", isFeatured: true },
  });
  const brandGree = await prisma.brand.create({
    data: { name: "Gree", slug: "gree", isFeatured: true },
  });

  // 7. Seed Products with rich variants & inventory
  const productsData = [
    {
      name: "Samsung 55 Inch Crystal 4K UHD Smart TV (CU7700)",
      slug: "samsung-55-crystal-4k-uhd-smart-tv",
      sku: "SAM-TV-55CU7700",
      categoryId: catTV.id,
      brandId: brandSamsung.id,
      description: "Experience lifelike colors and crystal-clear 4K resolution with PurColor and Crystal Processor 4K. Features Tizen OS, Voice Assistant, PC on TV, and bezel-less design.",
      shortDescription: "55 Inch 4K UHD, Crystal Processor 4K, Smart Hub, HDR10+",
      price: 58500,
      originalPrice: 65000,
      discount: 10,
      costPrice: 49000,
      stock: 12,
      lowStockThreshold: 3,
      weight: 14.5,
      dimensions: "123 x 71 x 6 cm",
      tags: "4k,smart tv,samsung,tizen,home cinema",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      reviewCount: 28,
      images: [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Apple iPhone 15 Pro Max (256GB / 512GB)",
      slug: "apple-iphone-15-pro-max",
      sku: "APL-IPH15PM-256",
      categoryId: catPhones.id,
      brandId: brandApple.id,
      description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
      shortDescription: "Titanium Design, A17 Pro Chip, 48MP Main Camera, USB-C",
      price: 154000,
      originalPrice: 165000,
      discount: 7,
      costPrice: 138000,
      stock: 8,
      lowStockThreshold: 2,
      weight: 0.22,
      dimensions: "16 x 7.6 x 0.8 cm",
      tags: "apple,iphone,flagship,5g,titanium",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      rating: 5.0,
      reviewCount: 42,
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      slug: "sony-wh-1000xm5-headphones",
      sku: "SNY-WH1000XM5-BLK",
      categoryId: catAudio.id,
      brandId: brandSony.id,
      description: "Industry-leading noise cancellation optimized by two processors and 8 microphones. Magnificent Sound quality engineered with precision, 30-hour battery life.",
      shortDescription: "Industry Leading ANC, 30-hr Battery, Multi-point connection, LDAC",
      price: 36500,
      originalPrice: 42000,
      discount: 13,
      costPrice: 29000,
      stock: 15,
      lowStockThreshold: 4,
      weight: 0.25,
      dimensions: "22 x 18 x 7 cm",
      tags: "sony,headphones,noise cancelling,bluetooth,audiophile",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      reviewCount: 35,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Gree 1.5 Ton Inverter Air Conditioner (Fairy Split)",
      slug: "gree-1-5-ton-inverter-ac",
      sku: "GRE-AC-15FAIRY",
      categoryId: catAC.id,
      brandId: brandGree.id,
      description: "Super efficient G-10 inverter technology saves up to 60% electricity. Cold plasma generator air purification, Turbo cooling mode, and Golden Fin anti-corrosion condenser.",
      shortDescription: "1.5 Ton Inverter, 60% Energy Saving, Cold Plasma Air Filter, Fast Cooling",
      price: 68000,
      originalPrice: 74000,
      discount: 8,
      costPrice: 56000,
      stock: 6,
      lowStockThreshold: 2,
      weight: 42.0,
      dimensions: "85 x 30 x 22 cm",
      tags: "ac,air conditioner,gree,inverter,cooling",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 4.8,
      reviewCount: 19,
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "Walton Non-Frost Inverter Refrigerator 380 Liters",
      slug: "walton-non-frost-inverter-refrigerator-380l",
      sku: "WLT-REF-380L-INV",
      categoryId: catAppliances.id,
      brandId: brandWalton.id,
      description: "Intelligent inverter technology with nano silver anti-bacterial protection. Tempered glass doors, rapid freezing zone, and 12 years compressor warranty.",
      shortDescription: "380L Capacity, Intelligent Inverter, Nano Silver Technology, Glass Door",
      price: 52000,
      originalPrice: 57500,
      discount: 9,
      costPrice: 42000,
      stock: 4,
      lowStockThreshold: 2,
      weight: 68.0,
      dimensions: "65 x 68 x 175 cm",
      tags: "refrigerator,walton,fridge,inverter,home",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.7,
      reviewCount: 14,
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
      ],
    },
    {
      name: "LG 8.5kg Front Loading Inverter AI DD Washing Machine",
      slug: "lg-8-5kg-front-load-ai-dd-washing-machine",
      sku: "LG-WM-85AIDD",
      categoryId: catAppliances.id,
      brandId: brandLG.id,
      description: "AI Direct Drive technology detects not only the weight, but also senses the softness of fabric to optimize washing motions. Steam allergy care cycle.",
      shortDescription: "8.5kg Capacity, AI Direct Drive, Steam Allergy Care, TurboWash 59",
      price: 64500,
      originalPrice: 72000,
      discount: 10,
      costPrice: 53000,
      stock: 5,
      lowStockThreshold: 2,
      weight: 60.0,
      dimensions: "60 x 56 x 85 cm",
      tags: "washing machine,lg,front load,smart appliances",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 4.8,
      reviewCount: 11,
      images: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80",
      ],
    },
  ];

  for (const item of productsData) {
    const { images, ...prodFields } = item;
    const product = await prisma.product.create({
      data: {
        ...prodFields,
        images: {
          create: images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            displayOrder: idx,
          })),
        },
        inventory: {
          create: {
            currentStock: prodFields.stock,
            soldQuantity: 5,
          },
        },
      },
    });

    // Create Initial Stock Transaction
    const inventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if (inventory) {
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          productId: product.id,
          previousStock: 0,
          changeQuantity: prodFields.stock,
          newStock: prodFields.stock,
          reason: "RESTOCK",
          notes: "Initial inventory setup",
          createdBy: "Admin",
        },
      });
    }

    // Add sample verified customer reviews
    await prisma.review.create({
      data: {
        productId: product.id,
        customerName: "Tanvir Ahmed",
        rating: 5,
        title: "100% Genuine & Excellent Service",
        comment: "Received the original product in intact box packaging. Delivery was super fast via Pathao Courier within 24 hours in Dhaka.",
        isVerifiedPurchase: true,
        isApproved: true,
        status: "APPROVED",
      },
    });
  }

  // 8. Seed Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        minOrderAmount: 1000,
        maxDiscount: 1500,
        usageLimit: 500,
        perCustomerLimit: 1,
        isActive: true,
      },
      {
        code: "SAVE500",
        type: "FIXED_AMOUNT",
        value: 500,
        minOrderAmount: 10000,
        usageLimit: 200,
        perCustomerLimit: 2,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: "FREE_SHIPPING",
        value: 0,
        minOrderAmount: 3000,
        freeShipping: true,
        isActive: true,
      },
      {
        code: "EID2026",
        type: "PERCENTAGE",
        value: 15,
        minOrderAmount: 20000,
        maxDiscount: 5000,
        usageLimit: 100,
        isActive: true,
      },
    ],
  });

  // 9. Seed Dynamic Homepage Hero Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Super Mega Tech Deals 2026",
        subtitle: "Up to 30% OFF on Official 4K TVs, Inverter ACs & Smartphones",
        ctaText: "Shop Big Deals",
        ctaLink: "/shop",
        imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "Official Samsung & Apple Hub",
        subtitle: "100% Authentic Products with Brand Official Warranty & Fast Delivery",
        ctaText: "Explore Flagships",
        ctaLink: "/shop?brand=samsung",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&auto=format&fit=crop&q=80",
        displayOrder: 2,
        isActive: true,
      },
    ],
  });

  // 10. Seed Sample Customers & Orders with Pathao Courier Shipments
  const sampleCustomer = await prisma.customer.create({
    data: {
      name: "Mahmudul Hasan",
      phone: "01711223344",
      email: "mahmud@example.com",
      totalOrders: 2,
      totalSpent: 95000,
      addresses: {
        create: {
          title: "Home",
          recipientName: "Mahmudul Hasan",
          phone: "01711223344",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhanmondi",
          area: "Road 8A",
          addressLine: "House #34, Road 8A, Dhanmondi, Dhaka",
          isDefault: true,
        },
      },
    },
  });

  const tvProduct = await prisma.product.findFirst({ where: { slug: "samsung-55-crystal-4k-uhd-smart-tv" } });
  const phoneProduct = await prisma.product.findFirst({ where: { slug: "apple-iphone-15-pro-max" } });

  if (tvProduct) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: "ORD-20260818-100234",
        customerId: sampleCustomer.id,
        customerName: "Mahmudul Hasan",
        customerPhone: "01711223344",
        customerEmail: "mahmud@example.com",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Dhanmondi",
        addressLine: "House #34, Road 8A, Dhanmondi, Dhaka",
        subtotal: tvProduct.price,
        discountAmount: 0,
        couponDiscount: 500,
        couponCode: "SAVE500",
        deliveryCharge: 70,
        totalAmount: tvProduct.price - 500 + 70,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "IN_TRANSIT",
        courierProvider: "PATHAO",
        consignmentId: "PTH-88992211",
        trackingCode: "TRACK-PTH-88992211",
        courierTrackingUrl: "https://pathao.com/courier/tracking/?consignment_id=PTH-88992211",
        items: {
          create: {
            productId: tvProduct.id,
            productName: tvProduct.name,
            sku: tvProduct.sku,
            quantity: 1,
            unitPrice: tvProduct.price,
            costPrice: tvProduct.costPrice,
            totalPrice: tvProduct.price,
          },
        },
        timeline: {
          createMany: {
            data: [
              { status: "PENDING", title: "Order Placed", description: "Placed via website with Cash on Delivery", createdBy: "Customer" },
              { status: "CONFIRMED", title: "Order Confirmed", description: "Customer confirmed via phone call", createdBy: "Admin" },
              { status: "COURIER_BOOKED", title: "Pathao Shipment Created", description: "Consignment ID: PTH-88992211 generated", createdBy: "Admin" },
              { status: "IN_TRANSIT", title: "Dispatched", description: "Picked up by Pathao courier rider", createdBy: "Pathao" },
            ],
          },
        },
        courierShipment: {
          create: {
            consignmentId: "PTH-88992211",
            merchantOrderId: "ORD-20260818-100234",
            trackingCode: "TRACK-PTH-88992211",
            trackingUrl: "https://pathao.com/courier/tracking/?consignment_id=PTH-88992211",
            status: "IN_TRANSIT",
            codAmount: tvProduct.price - 500 + 70,
            weight: 14.5,
          },
        },
      },
    });
  }

  // 11. Seed sample admin audit logs & notifications
  await prisma.notification.create({
    data: {
      type: "NEW_ORDER",
      title: "New Order #ORD-20260818-100234",
      message: "Mahmudul Hasan placed a new order for Samsung 55 Inch TV.",
      link: "/admin/orders",
    },
  });

  await prisma.auditLog.create({
    data: {
      userName: "Shop Owner",
      action: "CREATE_SHIPMENT",
      entity: "Order",
      entityId: "ORD-20260818-100234",
      newState: JSON.stringify({ consignmentId: "PTH-88992211", courier: "Pathao" }),
    },
  });

  console.log("Database seeded successfully with Purnima Electronics data!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
