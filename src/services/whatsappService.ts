import { Linking } from 'react-native';
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
    // Check if the WhatsApp app is installed via custom URL scheme
    const canOpen = await Linking.canOpenURL('whatsapp://');
    
    if (canOpen) {
      // Opening without a phone number prompts the user to select a chat or group inside WhatsApp
      const appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      await Linking.openURL(appUrl);
      return true;
    } else {
      // Fallback to the native Share sheet (allows sharing to WhatsApp if available/via extensions, or copying)
      const shareOptions = {
        message: message,
        failOnCancel: false,
      };
      await Share.open(shareOptions);
      return true;
    }
  } catch (error) {
    console.error('Failed to share order:', error);
    return false;
  }
};

