import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { Product } from '../hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = React.memo(({ product, onAddToCart }: ProductCardProps) => {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {hasImageError ? (
          <View style={[styles.image, styles.errorImage]}>
            <ImageIcon color={colors.outline} size={40} />
          </View>
        ) : (
          <>
            <FastImage
              style={styles.image}
              source={{
                uri: product.image,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.contain}
              onLoadStart={() => setIsLoadingImage(true)}
              onLoadEnd={() => setIsLoadingImage(false)}
              onError={() => {
                setIsLoadingImage(false);
                setHasImageError(true);
              }}
            />
            {isLoadingImage && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.details}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>£{product.price.toFixed(2)}</Text>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(product)}
          >
            <ShoppingCart size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    padding: spacing.m,
    flex: 1,
    margin: spacing.s,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    marginBottom: spacing.m,
    position: 'relative',
  },
  image: {
    height: 120,
    width: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  errorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.default,
  },
  details: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.full,
    marginBottom: spacing.s,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  name: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
    height: 48, // Fix height for 2 lines
  },
  price: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
