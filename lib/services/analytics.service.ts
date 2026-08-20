import prisma from "@/lib/prisma";

export async function getDashboardAnalytics(range: string = "30d") {
  const now = new Date();
  let startDate = new Date();

  switch (range) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
    default:
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  // Today start date for today's specific stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Queries
  const [
    totalOrders,
    todayOrders,
    ordersInRange,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    recentOrders,
    topSellingItems,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart }, isCancelled: false },
      select: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { orderStatus: { in: ["CONFIRMED", "PROCESSING", "PACKED"] } } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    prisma.order.count({ where: { orderStatus: { in: ["RETURN_REQUESTED", "RETURNED"] } } }),
    prisma.product.count({ where: { isArchived: false } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isArchived: false },
      take: 6,
      select: { id: true, name: true, stock: true, lowStockThreshold: true, price: true, sku: true },
    }),
    prisma.customer.count(),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Calculations
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  let rangeRevenue = 0;
  let rangeCost = 0;
  let rangeDiscounts = 0;

  // Chart data: Group orders by date
  const chartMap: Record<string, { date: string; revenue: number; orders: number; profit: number }> = {};

  ordersInRange.forEach((order) => {
    if (!order.isCancelled) {
      rangeRevenue += order.totalAmount;
      rangeDiscounts += order.couponDiscount + order.discountAmount;

      let orderCost = 0;
      order.items.forEach((item) => {
        orderCost += (item.costPrice || item.unitPrice * 0.75) * item.quantity;
      });
      rangeCost += orderCost;

      const dateKey = order.createdAt.toISOString().slice(0, 10);
      if (!chartMap[dateKey]) {
        chartMap[dateKey] = {
          date: new Date(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: 0,
          orders: 0,
          profit: 0,
        };
      }
      chartMap[dateKey].revenue += order.totalAmount;
      chartMap[dateKey].orders += 1;
      chartMap[dateKey].profit += (order.totalAmount - orderCost);
    }
  });

  const chartData = Object.values(chartMap);
  const grossProfit = Math.max(0, rangeRevenue - rangeCost);
  const estimatedNetProfit = Math.max(0, grossProfit - rangeDiscounts);

  return {
    metrics: {
      todayRevenue,
      todayOrderCount: todayOrders.length,
      rangeRevenue,
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalCustomers,
      grossProfit,
      estimatedNetProfit,
    },
    chartData,
    recentOrders,
    lowStockProducts,
    topSellingItems: topSellingItems.map((item) => ({
      productId: item.productId,
      name: item.productName,
      soldQuantity: item._sum.quantity || 0,
      totalRevenue: item._sum.totalPrice || 0,
    })),
  };
}
