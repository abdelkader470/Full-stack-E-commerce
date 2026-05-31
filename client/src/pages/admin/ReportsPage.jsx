import {
  BadgeDollarSign,
  Boxes,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  UsersRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategorySalesChart } from "../../components/admin/reports/CategorySalesChart";
import { ExportButtons } from "../../components/admin/reports/ExportButtons";
import { OrdersStatusChart } from "../../components/admin/reports/OrdersStatusChart";
import { ReportFilters } from "../../components/admin/reports/ReportFilters";
import { ReportStatsCard } from "../../components/admin/reports/ReportStatsCard";
import { ReportTable } from "../../components/admin/reports/ReportTable";
import { SalesChart } from "../../components/admin/reports/SalesChart";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/State";
import { api, money } from "../../lib/api";

const defaultFilters = {
  dateRange: "last30",
  startDate: "",
  endDate: "",
  orderStatus: "",
  paymentStatus: "",
  category: "",
  customer: "",
  product: ""
};

const paramsFromFilters = (filters) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  return params;
};

const compactProduct = (product) => ({
  id: product._id,
  name: product.name,
  category: product.category?.name || "Uncategorized",
  stock: product.stock ?? 0,
  sales: product.salesCount ?? 0,
  rating: product.rating ?? 0,
  value: money((product.stock || 0) * (product.price || 0))
});

function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase text-neutral-500">{eyebrow}</p>
        <h3 className="mt-1 text-2xl font-extrabold text-black dark:text-white">{title}</h3>
        {body && <p className="mt-1 text-sm text-neutral-500">{body}</p>}
      </div>
    </div>
  );
}

export function ReportsPage({ categories = [], customers = [], products = [] }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const query = useMemo(() => paramsFromFilters(filters), [filters]);

  const loadReports = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      const [summary, sales, orders, productReport, customerReport, inventory, revenue] = await Promise.all([
        api.get("/admin/reports/summary", { params: query }),
        api.get("/admin/reports/sales", { params: query }),
        api.get("/admin/reports/orders", { params: query }),
        api.get("/admin/reports/products", { params: query }),
        api.get("/admin/reports/customers", { params: query }),
        api.get("/admin/reports/inventory", { params: query }),
        api.get("/admin/reports/revenue", { params: query })
      ]);
      setReports({
        summary: summary.data,
        sales: sales.data,
        orders: orders.data,
        products: productReport.data,
        customers: customerReport.data,
        inventory: inventory.data,
        revenue: revenue.data
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const printReport = () => {
    document.body.classList.add("reports-printing");
    const cleanup = () => {
      document.body.classList.remove("reports-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1000);
  };

  if (loading) return <LoadingState label="Loading admin reports" />;

  const summary = reports?.summary || {};
  const sales = reports?.sales || {};
  const orders = reports?.orders || {};
  const productReport = reports?.products || {};
  const customerReport = reports?.customers || {};
  const inventory = reports?.inventory || {};
  const revenue = reports?.revenue || {};

  const orderStatusRows = Object.entries(orders.ordersByStatus || {}).map(([status, count]) => ({ status, count }));
  const paymentStatusRows = Object.entries(orders.ordersByPaymentStatus || {}).map(([status, count]) => ({ status, count }));
  const productColumns = [
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Stock", align: "right" },
    { key: "sales", label: "Sales", align: "right" },
    { key: "rating", label: "Rating", align: "right" }
  ];
  const customerColumns = [
    { key: "name", label: "Customer" },
    { key: "email", label: "Email" },
    { key: "orders", label: "Orders", align: "right" },
    { key: "spending", label: "Spending", align: "right", render: (row) => money(row.spending) }
  ];

  return (
    <div className="reports-print-area space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-neutral-500">Admin reports</p>
          <h2 className="mt-1 text-3xl font-extrabold text-black dark:text-white">Business intelligence</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Sales, orders, customer, inventory, product, and revenue reporting for the clothing store.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <ExportButtons filters={filters} onPrint={printReport} onPdf={printReport} />
          <Button type="button" variant="primary" onClick={loadReports} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="print:hidden">
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
          customers={customers}
          products={products}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatsCard label="Total sales" value={money(summary.totalSales)} helper="Compared with previous period" trend={summary.comparison?.salesChange} icon={BadgeDollarSign} />
        <ReportStatsCard label="Total orders" value={summary.totalOrders || 0} helper={`${summary.paidOrders || 0} paid / ${summary.pendingOrders || 0} pending`} trend={summary.comparison?.ordersChange} icon={ShoppingBag} />
        <ReportStatsCard label="Customers" value={summary.customerCount || 0} helper={`${customerReport.newCustomers || 0} new in range`} icon={UsersRound} />
        <ReportStatsCard label="Stock value" value={money(inventory.currentStockValue)} helper={`${inventory.lowStockAlert?.length || 0} low-stock alerts`} icon={Boxes} />
      </div>

      <section>
        <SectionTitle eyebrow="Sales report" title="Revenue performance" body="Track sales volume by day, week, month, year, and compare the active period." />
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <SalesChart data={sales.byDay || []} />
          <CategorySalesChart data={sales.salesByCategory || []} />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Orders report" title="Order operations" body="Status mix, payment mix, recent order activity, and customer value." />
        <div className="grid gap-6 xl:grid-cols-2">
          <OrdersStatusChart data={orders.ordersByStatus || {}} />
          <ReportTable
            title="Payment status"
            subtitle={`Average order value: ${money(orders.averageOrderValue)}`}
            columns={[
              { key: "status", label: "Status" },
              { key: "count", label: "Orders", align: "right" }
            ]}
            rows={paymentStatusRows}
          />
          <ReportTable
            title="Recent orders"
            columns={[
              { key: "_id", label: "Order", render: (row) => `#${row._id.slice(-8).toUpperCase()}` },
              { key: "customer", label: "Customer", render: (row) => row.user?.email || "Customer" },
              { key: "orderStatus", label: "Status" },
              { key: "totalPrice", label: "Total", align: "right", render: (row) => money(row.totalPrice) }
            ]}
            rows={orders.recentOrders || []}
          />
          <ReportTable title="Orders by status" columns={[{ key: "status", label: "Status" }, { key: "count", label: "Orders", align: "right" }]} rows={orderStatusRows} />
          <ReportTable title="Top customers by orders" columns={customerColumns} rows={orders.topCustomersByOrderCount || []} />
          <ReportTable title="Top customers by spending" columns={customerColumns} rows={orders.topCustomersBySpending || []} />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Products report" title="Clothing performance" body="Best sellers, low stock, top-rated products, no-sales products, and category sales." />
        <div className="grid gap-6 xl:grid-cols-2">
          <ReportTable title="Best-selling products" columns={productColumns} rows={(productReport.bestSellingProducts || []).map(compactProduct)} />
          <ReportTable title="Top-rated products" columns={productColumns} rows={(productReport.topRatedProducts || []).map(compactProduct)} />
          <ReportTable title="Low-stock products" columns={productColumns} rows={(productReport.lowStockProducts || []).map(compactProduct)} />
          <ReportTable title="Products with no sales" columns={productColumns} rows={(productReport.productsWithNoSales || []).map(compactProduct)} />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Customers report" title="Customer health" body="Customer counts, active customers, high spenders, and abandoned carts." />
        <div className="grid gap-4 sm:grid-cols-3">
          <ReportStatsCard label="Total customers" value={customerReport.totalCustomers || 0} helper="Customer role accounts" icon={UsersRound} />
          <ReportStatsCard label="New customers" value={customerReport.newCustomers || 0} helper="Created in selected range" icon={UsersRound} />
          <ReportStatsCard label="Active customers" value={customerReport.activeCustomers || 0} helper="Customers with orders" icon={UsersRound} />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ReportTable title="Highest spending customers" columns={customerColumns} rows={customerReport.highestSpending || []} />
          <ReportTable title="Most orders" columns={customerColumns} rows={customerReport.mostOrders || []} />
          <ReportTable
            title="Abandoned carts"
            columns={[
              { key: "customer", label: "Customer", render: (row) => row.user?.email || "Unknown" },
              { key: "items", label: "Items", align: "right", render: (row) => row.items?.length || 0 },
              { key: "updatedAt", label: "Updated", render: (row) => new Date(row.updatedAt).toLocaleDateString() }
            ]}
            rows={customerReport.abandonedCarts || []}
          />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Inventory report" title="Stock control" body="Current stock value, stock alerts, out-of-stock lists, and category stock value." />
        <div className="grid gap-4 sm:grid-cols-3">
          <ReportStatsCard label="Stock value" value={money(inventory.currentStockValue)} helper={`${inventory.totalUnits || 0} units`} icon={PackageSearch} />
          <ReportStatsCard label="Low stock" value={inventory.lowStockAlert?.length || 0} helper="Products at or below threshold" icon={Boxes} />
          <ReportStatsCard label="Out of stock" value={inventory.outOfStockList?.length || 0} helper="Products unavailable" icon={Boxes} />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ReportTable title="Out-of-stock list" columns={productColumns} rows={(inventory.outOfStockList || []).map(compactProduct)} />
          <ReportTable
            title="Inventory by category"
            columns={[
              { key: "category", label: "Category" },
              { key: "products", label: "Products", align: "right" },
              { key: "units", label: "Units", align: "right" },
              { key: "value", label: "Value", align: "right", render: (row) => money(row.value) }
            ]}
            rows={inventory.inventorySummaryByCategory || []}
          />
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Revenue report" title="Financial summary" body="Gross revenue, net revenue, discounts, taxes, shipping fees, refunds, and payment method mix." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <ReportStatsCard label="Gross" value={money(revenue.grossRevenue)} helper="Items subtotal" icon={ReceiptText} />
          <ReportStatsCard label="Net" value={money(revenue.netRevenue)} helper="Final order total" icon={BadgeDollarSign} />
          <ReportStatsCard label="Discounts" value={money(revenue.discountsTotal)} helper="Coupons applied" icon={ReceiptText} />
          <ReportStatsCard label="Tax" value={money(revenue.taxTotal)} helper="Collected tax" icon={ReceiptText} />
          <ReportStatsCard label="Shipping" value={money(revenue.shippingFeesTotal)} helper="Shipping fees" icon={ReceiptText} />
          <ReportStatsCard label="Refunds" value={money(revenue.refundsTotal)} helper="Refunded orders" icon={ReceiptText} />
        </div>
        <div className="mt-6">
          <ReportTable
            title="Revenue by payment method"
            columns={[
              { key: "method", label: "Payment method" },
              { key: "orders", label: "Orders", align: "right" },
              { key: "revenue", label: "Revenue", align: "right", render: (row) => money(row.revenue) }
            ]}
            rows={revenue.revenueByPaymentMethod || []}
          />
        </div>
      </section>
    </div>
  );
}
