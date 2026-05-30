export const buildInvoice = (order) => ({
  invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
  issuedAt: new Date(),
  orderId: order._id,
  customer: order.user,
  totals: {
    subtotal: order.itemsPrice,
    shipping: order.shippingPrice,
    tax: order.taxPrice,
    discount: order.discountAmount,
    total: order.totalPrice
  }
});
