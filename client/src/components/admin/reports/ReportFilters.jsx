const inputClass =
  "focus-ring w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm shadow-inner dark:border-neutral-800 dark:bg-neutral-950";

function FilterField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-extrabold uppercase text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export function ReportFilters({ filters, onChange, categories, customers, products }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const custom = filters.dateRange === "custom";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold">Report filters</h3>
          <p className="mt-1 text-sm text-neutral-500">Refine all dashboard reports with one professional filter set.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              dateRange: "last30",
              startDate: "",
              endDate: "",
              orderStatus: "",
              paymentStatus: "",
              category: "",
              customer: "",
              product: ""
            })
          }
          className="text-sm font-extrabold text-black underline-offset-4 hover:underline dark:text-white"
        >
          Reset filters
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterField label="Date range">
          <select className={inputClass} value={filters.dateRange} onChange={(event) => update("dateRange", event.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="thisYear">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </FilterField>
        {custom && (
          <>
            <FilterField label="Start date">
              <input className={inputClass} type="date" value={filters.startDate} onChange={(event) => update("startDate", event.target.value)} />
            </FilterField>
            <FilterField label="End date">
              <input className={inputClass} type="date" value={filters.endDate} onChange={(event) => update("endDate", event.target.value)} />
            </FilterField>
          </>
        )}
        <FilterField label="Order status">
          <select className={inputClass} value={filters.orderStatus} onChange={(event) => update("orderStatus", event.target.value)}>
            <option value="">All statuses</option>
            {["placed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Payment status">
          <select className={inputClass} value={filters.paymentStatus} onChange={(event) => update("paymentStatus", event.target.value)}>
            <option value="">All payments</option>
            {["pending", "authorized", "paid", "failed", "refunded"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Category">
          <select className={inputClass} value={filters.category} onChange={(event) => update("category", event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Customer">
          <select className={inputClass} value={filters.customer} onChange={(event) => update("customer", event.target.value)}>
            <option value="">All customers</option>
            {customers.filter((user) => user.role === "customer").map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Product">
          <select className={inputClass} value={filters.product} onChange={(event) => update("product", event.target.value)}>
            <option value="">All clothing</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>
        </FilterField>
      </div>
    </div>
  );
}
