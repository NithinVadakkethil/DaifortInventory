import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { User, ShoppingBag } from 'lucide-react-native';
import { useCartStore } from '../store/useCartStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { CartItem } from './CartItem';
import { colors, spacing, typography, rounded } from '../theme';
import { generateInvoiceAndShare } from '../services/pdfService';
import { CustomerSelector } from './CustomerSelector';

export const OrderSummaryPanel = () => {
  const items = useCartStore((state) => state.items);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const selectedCustomer = useCustomerStore((state) => state.selectedCustomer);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCustomerSelectorVisible, setCustomerSelectorVisible] = useState(false);

  const total = getCartTotal();
  const tax = total * 0.08; // Assuming 8% tax
  const grandTotal = total + tax;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const success = await generateInvoiceAndShare(items, selectedCustomer, total, tax);
    setIsCheckingOut(false);
    
    if (success) {
      Alert.alert('Order Complete', 'Invoice has been generated successfully.', [
        { text: 'OK', onPress: () => clearCart() }
      ]);
    } else {
      Alert.alert('Error', 'Could not generate or share invoice.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Order</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.customerSelector}
        onPress={() => setCustomerSelectorVisible(true)}
      >
        <User size={20} color={colors.primary} />
        <Text style={styles.customerName}>
          {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
        </Text>
      </TouchableOpacity>

      <CustomerSelector 
        visible={isCustomerSelectorVisible} 
        onClose={() => setCustomerSelectorVisible(false)} 
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <ShoppingBag size={48} color={colors.surfaceContainerHighest} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%)</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, items.length === 0 && styles.checkoutDisabled]}
          disabled={items.length === 0 || isCheckingOut}
          onPress={handleCheckout}
        >
          {isCheckingOut ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  clearText: {
    ...typography.labelMd,
    color: colors.error,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surfaceContainerLow,
    margin: spacing.m,
    borderRadius: rounded.default,
  },
  customerName: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginLeft: spacing.m,
  },
  cartList: {
    flexGrow: 1,
    paddingHorizontal: spacing.m,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    marginTop: spacing.m,
  },
  footer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderColor: colors.surfaceContainer,
    backgroundColor: colors.surfaceContainerLowest,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  summaryLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  summaryValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  grandTotalRow: {
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  grandTotalLabel: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  grandTotalValue: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: rounded.default,
    alignItems: 'center',
    marginTop: spacing.l,
  },
  checkoutDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  checkoutText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
});
