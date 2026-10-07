const paymentMethodLabels = {
  cash: 'Cash',
  qr: 'QR Payment',
  card: 'Credit / Debit Card',
};

export function getPaymentMethodLabel(paymentMethod) {
  return paymentMethodLabels[paymentMethod] ?? paymentMethod;
}
