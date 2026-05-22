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
      const price = item.negotiatedPrice ?? item.product.price;
      const lineTotal = item.quantity * price;
      const isNegotiated = item.negotiatedPrice !== undefined && item.negotiatedPrice !== item.product.price;
      const negotiatedSuffix = isNegotiated ? ` (negotiated from £${item.product.price.toFixed(2)} unit)` : '';
      return `${index + 1}. ${item.product.name} | Qty: ${item.quantity} | Unit: £${price.toFixed(2)}${negotiatedSuffix} | Total: £${lineTotal.toFixed(2)}`;
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

export type ShareResult = 'success' | 'cancelled' | 'failed';

export const shareOrderToWhatsApp = async (
  items: CartItemType[],
  customer: CustomerType | null,
  total: number
): Promise<ShareResult> => {
  if (items.length === 0) {
    return 'failed';
  }

  const message = buildOrderMessage(items, customer, total);

  try {
    // Check if the WhatsApp app is installed via custom URL scheme
    const canOpen = await Linking.canOpenURL('whatsapp://');
    
    if (canOpen) {
      // Opening without a phone number prompts the user to select a chat or group inside WhatsApp
      const appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      await Linking.openURL(appUrl);
      return 'success';
    } else {
      // Fallback to the native Share sheet (allows sharing to WhatsApp if available/via extensions, or copying)
      const shareOptions = {
        message: message,
        failOnCancel: true,
      };
      const result = await Share.open(shareOptions);
      return result.success ? 'success' : 'failed';
    }
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    if (
      errMsg.includes('User did not share') || 
      errMsg.includes('UserCanceled') || 
      errMsg.includes('CANCELLED') || 
      errMsg.includes('cancelled')
    ) {
      console.log('Share cancelled by user');
      return 'cancelled';
    }
    console.error('Failed to share order:', error);
    return 'failed';
  }
};

