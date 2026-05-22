import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItemType, useCartStore } from '../store/useCartStore';
import { colors, spacing, typography, rounded } from '../theme';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updatePrice = useCartStore((state) => state.updatePrice);
  const removeItem = useCartStore((state) => state.removeItem);

  const { product, quantity } = item;

  // Local state for text input fields to ensure smooth typing
  const [qtyText, setQtyText] = useState(quantity.toString());
  const [priceText, setPriceText] = useState((item.negotiatedPrice ?? product.price).toString());

  // Sync state if store updates externally
  useEffect(() => {
    setQtyText(quantity.toString());
  }, [quantity]);

  useEffect(() => {
    setPriceText((item.negotiatedPrice ?? product.price).toString());
  }, [item.negotiatedPrice, product.price]);

  const handleQtyChange = (text: string) => {
    setQtyText(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateQuantity(product.id, parsed);
    }
  };

  const handleQtyBlur = () => {
    const parsed = parseInt(qtyText, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setQtyText(quantity.toString());
    } else {
      updateQuantity(product.id, parsed);
    }
  };

  const handlePriceChange = (text: string) => {
    // Replace comma with dot if user typed a comma
    const sanitizedText = text.replace(',', '.');
    setPriceText(sanitizedText);
    const parsed = parseFloat(sanitizedText);
    if (!isNaN(parsed) && parsed >= 0) {
      updatePrice(product.id, parsed);
    }
  };

  const handlePriceBlur = () => {
    const parsed = parseFloat(priceText);
    if (isNaN(parsed) || parsed < 0) {
      setPriceText((item.negotiatedPrice ?? product.price).toString());
    } else {
      updatePrice(product.id, parsed);
    }
  };

  const currentPrice = item.negotiatedPrice ?? product.price;

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.image}
        source={{ uri: product.image }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceRow}>
          {/* Editable Unit Price Input */}
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="decimal-pad"
              value={priceText}
              onChangeText={handlePriceChange}
              onBlur={handlePriceBlur}
              selectTextOnFocus
            />
          </View>

          {/* Struck-through Original Price if Negotiated */}
          {item.negotiatedPrice !== undefined && item.negotiatedPrice !== product.price && (
            <Text style={styles.originalPrice}>£{product.price.toFixed(2)}</Text>
          )}

          {/* Line Total */}
          <Text style={styles.lineTotal}>
            Total: £{(currentPrice * quantity).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {/* Typable Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              keyboardType="number-pad"
              value={qtyText}
              onChangeText={handleQtyChange}
              onBlur={handleQtyBlur}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(product.id)}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: rounded.default,
    marginRight: spacing.m,
  },
  details: {
    flex: 1,
  },
  name: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.sm,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.s,
    height: 28,
  },
  currencySymbol: {
    fontFamily: 'Inter-Regular',
    color: colors.onSurfaceVariant,
    fontSize: 13,
    marginRight: 1,
  },
  priceInput: {
    fontFamily: 'Inter-Regular',
    fontWeight: '600',
    color: colors.primary,
    minWidth: 50,
    padding: 0,
    height: '100%',
    fontSize: 13,
    textAlignVertical: 'center',
  },
  originalPrice: {
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
    color: colors.outline,
    fontSize: 12,
  },
  lineTotal: {
    fontFamily: 'Inter-Regular',
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: 'auto',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.full,
    paddingHorizontal: spacing.xs,
    height: 32,
  },
  stepButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  quantityInput: {
    fontFamily: 'Inter-Medium',
    color: colors.onSurface,
    marginHorizontal: spacing.s,
    minWidth: 30,
    textAlign: 'center',
    padding: 0,
    fontWeight: '600',
    fontSize: 14,
    height: '100%',
    textAlignVertical: 'center',
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
