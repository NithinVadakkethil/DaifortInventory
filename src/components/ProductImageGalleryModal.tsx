import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { X, Image as ImageIcon, ShoppingCart } from 'lucide-react-native';
import { colors, spacing, typography, rounded, shadows } from '../theme';
import { Product } from '../hooks/useProducts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_WIDTH = 680;
const IMAGE_HEIGHT = 420;

interface ProductImageGalleryModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const GalleryImage = ({ uri }: { uri: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={styles.galleryImageWrapper}>
      {error ? (
        <View style={styles.errorImage}>
          <ImageIcon size={48} color={colors.outline} />
          <Text style={styles.errorText}>Image unavailable</Text>
        </View>
      ) : (
        <>
          <FastImage
            style={styles.galleryImage}
            source={{ uri, priority: FastImage.priority.high }}
            resizeMode={FastImage.resizeMode.contain}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
          {loading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export const ProductImageGalleryModal = ({
  product,
  visible,
  onClose,
  onAddToCart,
}: ProductImageGalleryModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / GALLERY_WIDTH);
    setActiveIndex(index);
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * GALLERY_WIDTH, animated: true });
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Image Count Badge */}
          {images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                {activeIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Scrollable Images */}
          <View style={styles.imageContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              decelerationRate="fast"
              snapToInterval={GALLERY_WIDTH}
              snapToAlignment="center"
              style={styles.imageScroll}
            >
              {images.map((uri, index) => (
                <GalleryImage key={`${uri}-${index}`} uri={uri} />
              ))}
            </ScrollView>
          </View>

          {/* Dot Indicators */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dot, activeIndex === index && styles.dotActive]}
                  onPress={() => handleDotPress(index)}
                />
              ))}
            </View>
          )}

          {/* Product Details Footer */}
          <View style={styles.footer}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Unit Price</Text>
              <Text style={styles.price}>£{product.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <ShoppingCart size={18} color={colors.onPrimary} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: GALLERY_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: rounded.xl,
    overflow: 'hidden',
    ...shadows.lg ?? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 12,
    },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.l,
    paddingBottom: spacing.m,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.m,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 91, 191, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  productName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    lineHeight: 26,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  imageCountBadge: {
    position: 'absolute',
    top: spacing.l,
    right: spacing.l + 36 + spacing.m,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.s,
    paddingVertical: 3,
    borderRadius: rounded.full,
    zIndex: 10,
  },
  imageCountText: {
    ...typography.labelSm,
    color: '#fff',
    fontSize: 11,
  },
  imageContainer: {
    width: GALLERY_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surfaceContainer,
  },
  imageScroll: {
    flex: 1,
  },
  galleryImageWrapper: {
    width: GALLERY_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: GALLERY_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  errorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.m,
    gap: 6,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surface,
  },
  priceSection: {
    flexDirection: 'column',
  },
  priceLabel: {
    ...typography.labelSm,
    color: colors.outline,
    marginBottom: 2,
  },
  price: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '800',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: rounded.default,
    ...shadows.sm,
  },
  addToCartText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
