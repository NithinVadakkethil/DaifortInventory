import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Plus, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography, rounded, shadows } from '../theme';
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
            <ImageIcon color={colors.outline} size={32} />
          </View>
        ) : (
          <>
            <FastImage
              style={styles.image}
              source={{
                uri: product.image,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onLoadStart={() => setIsLoadingImage(true)}
              onLoadEnd={() => setIsLoadingImage(false)}
              onError={() => {
                setIsLoadingImage(false);
                setHasImageError(true);
              }}
            />
            {isLoadingImage && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={colors.primary} size="small" />
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
        
        <View style={styles.footer}>
          <Text style={styles.price}>£{product.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(product)}
            activeOpacity={0.7}
          >
            <Plus size={18} color={colors.onPrimary} strokeWidth={3} />
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
    flex: 1,
    margin: spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.sm,
    overflow: 'hidden', // clips the image nicely to the border radius
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  errorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  details: {
    padding: spacing.m,
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 91, 191, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.sm,
    marginBottom: spacing.s,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  name: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.m,
    height: 40,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    ...typography.titleMd,
    color: colors.onSurface,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
