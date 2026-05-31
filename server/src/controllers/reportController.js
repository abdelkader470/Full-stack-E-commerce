import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Cart } from "../models/Cart.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

const orderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "authorized", "paid", "failed", "refunded"];

const asObjectId = (value) =>
  value && mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getDateWindow = (query = {}) => {
  const now = new Date();
  let startDate;
  let endDate;

  if (query.startDate || query.endDate) {
    startDate = query.startDate ? startOfDay(new Date(query.startDate)) : new Date("2000-01-01");
    endDate = query.endDate ? endOfDay(new Date(query.endDate)) : endOfDay(now);
  } else {
    switch (query.dateRange || "last30") {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "yesterday": {
        const yesterday = addDays(now, -1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      }
      case "last7":
        startDate = startOfDay(addDays(now, -6));
        endDate = endOfDay(now);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = endOfDay(now);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = endOfDay(now);
        break;
      case "last30":
      default:
        startDate = startOfDay(addDays(now, -29));
        endDate = endOfDay(now);
        break;
    }
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    startDate = startOfDay(addDays(now, -29));
    endDate = endOfDay(now);
  }

  const duration = Math.max(endDate.getTime() - startDate.getTime(), 24 * 60 * 60 * 1000);
  return {
    startDate,
    endDate,
    previousStartDate: new Date(startDate.getTime() - duration - 1),
    previousEndDate: new Date(startDate.getTime() - 1)
  };
};

const buildOrderMatch = (query = {}, overrideDates) => {
  const { startDate, endDate } = overrideDates || getDateWindow(query);
  const match = { createdAt: { $gte: startDate, $lte: endDate } };
  if (query.orderStatus) match.orderStatus = query.orderStatus;
  if (query.paymentStatus) match.paymentStatus = query.paymentStatus;
  const customerId = asObjectId(query.customer);
  if (customerId) match.user = customerId;
  const productId = asObjectId(query.product);
  if (productId) match["orderItems.product"] = productId;
  return match;
};

const categoryFilterStages = (query = {}) => {
  const categoryId = asObjectId(query.category);
  return categoryId
    ? [
        { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "categoryFilterProducts" } },
        { $match: { "categoryFilterProducts.category": categoryId } }
      ]
    : [];
};

const normalizeCounts = (rows, keys) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: rows.find((row) => row._id === key)?.count || 0 }), {});

const percentChange = (current, previous) => {
  if (!previous && current) return 100;
  if (!previous) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const moneyValue = (value) => Number((value || 0).toFixed(2));

const getSalesOverview = async (query) => {
  const window = getDateWindow(query);
  const currentMatch = buildOrderMatch(query, window);
  const previousMatch = buildOrderMatch(query, {
    startDate: window.previousStartDate,
    endDate: window.previousEndDate
  });

  // The overview runs current and previous windows with the same filters so the
  // dashboard can show period-over-period sales and order comparisons.
  const [current, previous, orderStatusRows, paymentStatusRows] = await Promise.all([
    Order.aggregate([
      { $match: currentMatch },
      ...categoryFilterStages(query),
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          discounts: { $sum: "$discountAmount" },
          taxes: { $sum: "$taxPrice" },
          shipping: { $sum: "$shippingPrice" }
        }
      }
    ]),
    Order.aggregate([
      { $match: previousMatch },
      ...categoryFilterStages(query),
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
    ]),
    Order.aggregate([{ $match: currentMatch }, { $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: currentMatch }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }])
  ]);

  const now = current[0] || {};
  const before = previous[0] || {};

  return {
    totalSales: moneyValue(now.totalSales),
    totalOrders: now.totalOrders || 0,
    paidOrders: paymentStatusRows.find((row) => row._id === "paid")?.count || 0,
    pendingOrders: paymentStatusRows.find((row) => row._id === "pending")?.count || 0,
    cancelledOrders: orderStatusRows.find((row) => row._id === "cancelled")?.count || 0,
    refundedOrders: paymentStatusRows.find((row) => row._id === "refunded")?.count || 0,
    comparison: {
      salesChange: percentChange(now.totalSales || 0, before.totalSales || 0),
      ordersChange: percentChange(now.totalOrders || 0, before.totalOrders || 0),
      previousSales: moneyValue(before.totalSales),
      previousOrders: before.totalOrders || 0
    }
  };
};

const getSalesSeries = (query, groupBy = "day") => {
  const formats = {
    day: "%Y-%m-%d",
    week: "%G-W%V",
    month: "%Y-%m",
    year: "%Y"
  };

  return Order.aggregate([
    { $match: buildOrderMatch(query) },
    ...categoryFilterStages(query),
    {
      $group: {
        _id: { $dateToString: { format: formats[groupBy] || formats.day, date: "$createdAt" } },
        sales: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, label: "$_id", sales: { $round: ["$sales", 2] }, orders: 1 } }
  ]);
};

const getCategorySales = (query) =>
  Order.aggregate([
    { $match: buildOrderMatch(query) },
    { $unwind: "$orderItems" },
    { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ...(asObjectId(query.category) ? [{ $match: { "product.category": asObjectId(query.category) } }] : []),
    ...(asObjectId(query.product) ? [{ $match: { "orderItems.product": asObjectId(query.product) } }] : []),
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$category.name",
        sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        quantity: { $sum: "$orderItems.quantity" }
      }
    },
    { $sort: { sales: -1 } },
    { $project: { _id: 0, category: { $ifNull: ["$_id", "Uncategorized"] }, sales: { $round: ["$sales", 2] }, quantity: 1 } }
  ]);

export const getSummaryReport = asyncHandler(async (req, res) => {
  const [sales, customerCount, productCount, lowStockCount] = await Promise.all([
    getSalesOverview(req.query),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({ status: "active", stock: { $lte: 5 } })
  ]);

  res.json({ ...sales, customerCount, productCount, lowStockCount });
});

export const getSalesReport = asyncHandler(async (req, res) => {
  const [overview, byDay, byWeek, byMonth, byYear, salesByCategory] = await Promise.all([
    getSalesOverview(req.query),
    getSalesSeries(req.query, "day"),
    getSalesSeries(req.query, "week"),
    getSalesSeries(req.query, "month"),
    getSalesSeries(req.query, "year"),
    getCategorySales(req.query)
  ]);

  res.json({ overview, byDay, byWeek, byMonth, byYear, salesByCategory });
});

export const getOrdersReport = asyncHandler(async (req, res) => {
  const match = buildOrderMatch(req.query);
  const [summary, statusRows, paymentRows, recentOrders, topByCount, topBySpending] = await Promise.all([
    Order.aggregate([
      { $match: match },
      ...categoryFilterStages(req.query),
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([{ $match: match }, { $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: match }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
    Order.find(match).populate("user", "name email").sort("-createdAt").limit(8),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$user", orders: { $sum: 1 }, spending: { $sum: "$totalPrice" } } },
      { $sort: { orders: -1 } },
      { $limit: 6 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
      { $unwind: "$customer" },
      { $project: { _id: 0, name: "$customer.name", email: "$customer.email", orders: 1, spending: { $round: ["$spending", 2] } } }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$user", orders: { $sum: 1 }, spending: { $sum: "$totalPrice" } } },
      { $sort: { spending: -1 } },
      { $limit: 6 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
      { $unwind: "$customer" },
      { $project: { _id: 0, name: "$customer.name", email: "$customer.email", orders: 1, spending: { $round: ["$spending", 2] } } }
    ])
  ]);

  const totals = summary[0] || {};
  res.json({
    totalOrders: totals.totalOrders || 0,
    averageOrderValue: totals.totalOrders ? moneyValue(totals.totalRevenue / totals.totalOrders) : 0,
    ordersByStatus: normalizeCounts(statusRows, orderStatuses),
    ordersByPaymentStatus: normalizeCounts(paymentRows, paymentStatuses),
    recentOrders,
    topCustomersByOrderCount: topByCount,
    topCustomersBySpending: topBySpending
  });
});

export const getProductsReport = asyncHandler(async (req, res) => {
  const categoryId = asObjectId(req.query.category);
  const productMatch = { status: "active" };
  if (categoryId) productMatch.category = categoryId;
  const productId = asObjectId(req.query.product);
  if (productId) productMatch._id = productId;

  const [bestSellingProducts, lowStockProducts, outOfStockProducts, topRatedProducts, soldRows, productSalesByCategory] =
    await Promise.all([
      Product.find(productMatch).populate("category", "name").sort("-salesCount").limit(8),
      Product.find({ ...productMatch, stock: { $gt: 0, $lte: 5 } }).populate("category", "name").sort("stock").limit(10),
      Product.find({ ...productMatch, stock: { $lte: 0 } }).populate("category", "name").sort("name").limit(10),
      Product.find(productMatch).populate("category", "name").sort("-rating -numReviews").limit(8),
      Order.aggregate([
        { $match: buildOrderMatch(req.query) },
        { $unwind: "$orderItems" },
        { $group: { _id: "$orderItems.product" } }
      ]),
      getCategorySales(req.query)
    ]);

  const soldIds = soldRows.map((row) => row._id).filter(Boolean);
  const noSalesFilter = soldIds.length ? { ...productMatch, _id: { $nin: soldIds } } : productMatch;
  const productsWithNoSales = await Product.find(noSalesFilter).populate("category", "name").sort("name").limit(10);

  res.json({
    bestSellingProducts,
    lowStockProducts,
    outOfStockProducts,
    mostViewedProducts: [],
    topRatedProducts,
    productsWithNoSales,
    productSalesByCategory
  });
});

export const getCustomersReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateWindow(req.query);
  const match = buildOrderMatch(req.query);
  const customerId = asObjectId(req.query.customer);
  const userFilter = { role: "customer" };
  if (customerId) userFilter._id = customerId;

  const [totalCustomers, newCustomers, activeRows, highestSpending, mostOrders, abandonedCarts] = await Promise.all([
    User.countDocuments(userFilter),
    User.countDocuments({ ...userFilter, createdAt: { $gte: startDate, $lte: endDate } }),
    Order.aggregate([{ $match: match }, { $group: { _id: "$user" } }, { $count: "activeCustomers" }]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$user", orders: { $sum: 1 }, spending: { $sum: "$totalPrice" } } },
      { $sort: { spending: -1 } },
      { $limit: 8 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
      { $unwind: "$customer" },
      { $project: { _id: 0, name: "$customer.name", email: "$customer.email", orders: 1, spending: { $round: ["$spending", 2] } } }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$user", orders: { $sum: 1 }, spending: { $sum: "$totalPrice" } } },
      { $sort: { orders: -1 } },
      { $limit: 8 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
      { $unwind: "$customer" },
      { $project: { _id: 0, name: "$customer.name", email: "$customer.email", orders: 1, spending: { $round: ["$spending", 2] } } }
    ]),
    Cart.find({ items: { $ne: [] } }).populate("user", "name email").sort("-updatedAt").limit(8)
  ]);

  res.json({
    totalCustomers,
    newCustomers,
    activeCustomers: activeRows[0]?.activeCustomers || 0,
    highestSpending,
    mostOrders,
    abandonedCarts
  });
});

export const getInventoryReport = asyncHandler(async (req, res) => {
  const categoryId = asObjectId(req.query.category);
  const productMatch = { status: "active" };
  if (categoryId) productMatch.category = categoryId;
  const productId = asObjectId(req.query.product);
  if (productId) productMatch._id = productId;

  const [summary, lowStock, outOfStock, byCategory] = await Promise.all([
    Product.aggregate([
      { $match: productMatch },
      {
        $group: {
          _id: null,
          products: { $sum: 1 },
          units: { $sum: "$stock" },
          stockValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      }
    ]),
    Product.find({ ...productMatch, stock: { $gt: 0, $lte: 5 } }).populate("category", "name").sort("stock").limit(12),
    Product.find({ ...productMatch, stock: { $lte: 0 } }).populate("category", "name").sort("name").limit(12),
    Product.aggregate([
      { $match: productMatch },
      { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$category.name",
          products: { $sum: 1 },
          units: { $sum: "$stock" },
          value: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      },
      { $sort: { value: -1 } },
      { $project: { _id: 0, category: { $ifNull: ["$_id", "Uncategorized"] }, products: 1, units: 1, value: { $round: ["$value", 2] } } }
    ])
  ]);

  res.json({
    currentStockValue: moneyValue(summary[0]?.stockValue),
    totalUnits: summary[0]?.units || 0,
    totalProducts: summary[0]?.products || 0,
    lowStockAlert: lowStock,
    outOfStockList: outOfStock,
    productStockMovement: [],
    inventorySummaryByCategory: byCategory
  });
});

export const getRevenueReport = asyncHandler(async (req, res) => {
  const match = buildOrderMatch(req.query);
  const [summary, byPaymentMethod] = await Promise.all([
    Order.aggregate([
      { $match: match },
      ...categoryFilterStages(req.query),
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$itemsPrice" },
          netRevenue: { $sum: "$totalPrice" },
          discountsTotal: { $sum: "$discountAmount" },
          taxTotal: { $sum: "$taxPrice" },
          shippingFeesTotal: { $sum: "$shippingPrice" },
          refundsTotal: { $sum: { $cond: [{ $eq: ["$paymentStatus", "refunded"] }, "$totalPrice", 0] } }
        }
      }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$paymentMethod", revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $project: { _id: 0, method: { $ifNull: ["$_id", "unknown"] }, revenue: { $round: ["$revenue", 2] }, orders: 1 } }
    ])
  ]);

  const totals = summary[0] || {};
  res.json({
    grossRevenue: moneyValue(totals.grossRevenue),
    netRevenue: moneyValue(totals.netRevenue),
    discountsTotal: moneyValue(totals.discountsTotal),
    taxTotal: moneyValue(totals.taxTotal),
    shippingFeesTotal: moneyValue(totals.shippingFeesTotal),
    refundsTotal: moneyValue(totals.refundsTotal),
    revenueByPaymentMethod: byPaymentMethod
  });
});

export const exportReports = asyncHandler(async (req, res) => {
  const [summary, sales, orders, products, customers, inventory, revenue] = await Promise.all([
    getSalesOverview(req.query),
    getSalesSeries(req.query, req.query.groupBy || "day"),
    getOrdersReportData(req.query),
    getCategorySales(req.query),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ status: "active", stock: { $lte: 5 } }),
    Order.aggregate([{ $match: buildOrderMatch(req.query) }, { $group: { _id: "$paymentMethod", revenue: { $sum: "$totalPrice" } } }])
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    filters: req.query,
    summary,
    sales,
    orders,
    productSalesByCategory: products,
    customers: { totalCustomers: customers },
    inventory: { lowStockProducts: inventory },
    revenueByPaymentMethod: revenue
  };

  if (req.query.format === "csv") {
    const rows = [["Metric", "Value"], ...Object.entries(summary).map(([key, value]) => [key, JSON.stringify(value)])];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=marketlane-report.csv");
    return res.send(rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n"));
  }

  return res.json(payload);
});

const getOrdersReportData = async (query) => {
  const match = buildOrderMatch(query);
  const rows = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$orderStatus",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" }
      }
    },
    { $project: { _id: 0, status: "$_id", orders: 1, revenue: { $round: ["$revenue", 2] } } }
  ]);
  return rows;
};
