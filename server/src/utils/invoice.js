export const buildInvoice = (order) => ({
  invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
  issuedAt: new Date(),
  orderId: order._id,
  orderNumber: order._id.toString().slice(-8).toUpperCase(),
  orderDate: order.createdAt,
  customer: {
    name: order.user?.name || order.shippingAddress?.fullName,
    email: order.user?.email,
    phone: order.shippingAddress?.phone
  },
  shippingAddress: order.shippingAddress,
  payment: {
    method: order.paymentMethod,
    status: order.paymentStatus,
    paidAt: order.paidAt,
    transactionId: order.paymentResult?.id
  },
  fulfillment: {
    status: order.orderStatus,
    trackingNumber: order.trackingNumber,
    deliveredAt: order.deliveredAt
  },
  items: order.orderItems.map((item) => ({
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions,
    lineTotal: Number((item.price * item.quantity).toFixed(2))
  })),
  couponCode: order.couponCode,
  totals: {
    subtotal: order.itemsPrice,
    shipping: order.shippingPrice,
    tax: order.taxPrice,
    discount: order.discountAmount,
    total: order.totalPrice
  }
});
