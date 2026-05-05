import Share from 'react-native-share';
import { CartItemType } from '../store/useCartStore';
import { CustomerType } from '../store/useCustomerStore';

const buildOrderMessage = (
  items: CartItemType[],
  customer: CustomerType | null,
  total: number
) => {
  const date = new Date().toLocaleString();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const customerDetails = [
    `Name: ${customer?.name || 'Walk-in Customer'}`,
    `Phone: ${customer?.phone || 'N/A'}`,
    `Email: ${customer?.email || 'N/A'}`,
    `Address: ${customer?.address || 'N/A'}`,
  ].join('\n');

  const productDetails = items
    .map((item, index) => {
      const lineTotal = item.quantity * item.product.price;
      return `${index + 1}. ${item.product.name} | Qty: ${item.quantity} | Unit: £${item.product.price.toFixed(2)} | Total: £${lineTotal.toFixed(2)}`;
    })
    .join('\n');

  return `New Order - ${date}

Customer Details
${customerDetails}

Selected Products
${productDetails}

Total Items: ${totalItems}
Total Amount: £${total.toFixed(2)}`;
};

export const shareOrderToWhatsApp = async (
  items: CartItemType[],
  customer: CustomerType | null,
  total: number
) => {
  if (items.length === 0) {
    return false;
  }

  const message = buildOrderMessage(items, customer, total);

  try {
    await Share.shareSingle({
      social: Share.Social.WHATSAPP,
      message,
      failOnCancel: false,
    });
    return true;
  } catch (error) {
    console.error('Failed to share order to WhatsApp:', error);
    return false;
  }
};
