import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { CartItemType } from '../store/useCartStore';
import { CustomerType } from '../store/useCustomerStore';
import { Platform } from 'react-native';

export const generateInvoiceAndShare = async (
  items: CartItemType[],
  customer: CustomerType | null,
  total: number,
  tax: number
) => {
  const date = new Date().toLocaleDateString();
  const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`;
  const grandTotal = total + tax;

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { margin: 0; color: #1a73e8; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .customer-info, .invoice-info { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f7f9fb; }
          .totals { width: 40%; float: right; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 12px; }
          .footer { clear: both; margin-top: 50px; text-align: center; font-size: 0.9em; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daifort Wholesale</h1>
          <p>Official Invoice</p>
        </div>
        
        <div class="details">
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${customer?.name || 'Walk-in Customer'}</strong></p>
            <p>${customer?.email || 'N/A'}</p>
            <p>${customer?.phone || 'N/A'}</p>
            <p>${customer?.address || 'N/A'}</p>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.product.price.toFixed(2)}</td>
                <td>$${(item.quantity * item.product.price).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (8%):</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>$${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
        </div>
      </body>
    </html>
  `;

  try {
    const options = {
      html: htmlContent,
      fileName: invoiceNumber,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    
    // Check if the file is generated
    if (!file.filePath) {
        throw new Error('PDF file generation failed.');
    }

    // Prepare for sharing
    let sharePath = file.filePath;
    
    // React native share needs file:// prefix on iOS
    if (Platform.OS === 'ios' && !sharePath.startsWith('file://')) {
        sharePath = `file://${sharePath}`;
    }

    const shareOptions = {
      title: 'Share Invoice',
      url: sharePath,
      type: 'application/pdf',
      failOnCancel: false,
    };

    await Share.open(shareOptions);
    return true;
  } catch (error) {
    console.error('Error generating or sharing PDF:', error);
    return false;
  }
};
