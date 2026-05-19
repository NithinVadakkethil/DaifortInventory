import { Linking } from 'react-native';
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
  const cleanPhone = customer?.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
  
  // Format local UK numbers if needed (e.g. 07123... -> 447123...)
  let formattedPhone = cleanPhone;
  if (cleanPhone && cleanPhone.startsWith('0') && !cleanPhone.startsWith('00')) {
    formattedPhone = '44' + cleanPhone.substring(1);
  } else if (cleanPhone && cleanPhone.startsWith('00')) {
    formattedPhone = cleanPhone.substring(2);
  }

  try {
    // Check if the WhatsApp app is installed via custom URL scheme
    const canOpen = await Linking.canOpenURL('whatsapp://');
    
    if (canOpen) {
      const appUrl = formattedPhone
        ? `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
        : `whatsapp://send?text=${encodeURIComponent(message)}`;
      await Linking.openURL(appUrl);
      return true;
    } else {
      // Fallback to WhatsApp Web/API
      const webUrl = formattedPhone
        ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (error) {
    console.error('Failed to share order to WhatsApp:', error);
    return false;
  }
};
