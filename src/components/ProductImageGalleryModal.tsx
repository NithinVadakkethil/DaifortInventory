import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { X, Image as ImageIcon, ShoppingCart, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { Product } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';

interface ProductImageGalleryModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const GalleryImage = ({
  uri,
  width,
  height,
  onTapImage,
}: {
  uri: string;
  width: number;
  height: number;
  onTapImage: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={onTapImage}>
      <View style={[styles.galleryImageWrapper, { width, height }]}>
        {error ? (
          <View style={styles.errorImage}>
            <ImageIcon size={48} color={colors.outline} />
            <Text style={styles.errorText}>Image unavailable</Text>
          </View>
        ) : (
          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.zoomScrollContent, { width, height }]}
          >
            <View style={{ width, height }}>
              <FastImage
                style={{ width, height }}
                source={{ uri, priority: FastImage.priority.high }}
                resizeMode={FastImage.resizeMode.contain}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            </View>
          </ScrollView>
        )}
        {loading && !error && (
          <View style={styles.imageLoader}>
            <ActivityIndicator color="#ffffff" size="large" />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export const ProductImageGalleryModal = ({
  product,
  visible,
  onClose,
  onAddToCart,
}: ProductImageGalleryModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const isInCart = product ? items.some((item) => item.product.id === product.id) : false;

  // Reset active page and show controls when product changes or modal opens
  useEffect(() => {
    if (visible) {
      setActiveIndex(0);
      setShowControls(true);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }
  }, [product?.id, visible]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / windowWidth);
    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * windowWidth, animated: true });
  };

  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      scrollRef.current?.scrollTo({ x: nextIdx * windowWidth, animated: true });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      const prevIdx = activeIndex - 1;
      setActiveIndex(prevIdx);
      scrollRef.current?.scrollTo({ x: prevIdx * windowWidth, animated: true });
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      <View style={styles.overlay}>
        {/* Fullscreen Swipable Image List */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          style={styles.imageScroll}
          contentContainerStyle={{ width: windowWidth * images.length, height: windowHeight }}
        >
          {images.map((uri, index) => (
            <GalleryImage
              key={`${uri}-${index}`}
              uri={uri}
              width={windowWidth}
              height={windowHeight}
              onTapImage={toggleControls}
            />
          ))}
        </ScrollView>

        {/* Floating Header Bar */}
        {showControls && (
          <View style={[styles.headerPanel, { paddingTop: Math.max(insets.top, spacing.m) }]}>
            <View style={styles.headerLeft}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
            </View>
            
            <View style={styles.headerRight}>
              {images.length > 1 && (
                <Text style={styles.counterText}>
                  {activeIndex + 1} of {images.length}
                </Text>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <X size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Floating Side Arrow Controls */}
        {showControls && images.length > 1 && activeIndex > 0 && (
          <TouchableOpacity style={styles.prevArrow} onPress={handlePrev} activeOpacity={0.7}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
        )}
        {showControls && images.length > 1 && activeIndex < images.length - 1 && (
          <TouchableOpacity style={styles.nextArrow} onPress={handleNext} activeOpacity={0.7}>
            <ChevronRight size={28} color="#ffffff" />
          </TouchableOpacity>
        )}

        {/* Floating Bottom Control Panel */}
        {showControls && (
          <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
            {images.length > 1 && (
              <View style={styles.thumbnailSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsContent}
                >
                  {images.map((uri, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <TouchableOpacity
                        key={`${uri}-${index}`}
                        activeOpacity={0.8}
                        onPress={() => handleDotPress(index)}
                        style={[
                          styles.thumbnailWrapper,
                          isActive && styles.thumbnailActive,
                        ]}
                      >
                        <FastImage
                          source={{ uri }}
                          style={styles.thumbnail}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.actionRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Unit Price</Text>
                <Text style={styles.priceText}>£{product.price.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.addToCartBtn, isInCart && styles.addedBtn]}
                onPress={handleAddToCart}
                activeOpacity={0.8}
                disabled={isInCart}
              >
                {isInCart ? (
                  <>
                    <Check size={20} color="#ffffff" />
                    <Text style={styles.addToCartBtnText}>Added!</Text>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} color={colors.onPrimary} />
                    <Text style={styles.addToCartBtnText}>Add to Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  imageScroll: {
    flex: 1,
  },
  galleryImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  zoomScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
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
  headerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 12, 0.65)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.m,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 91, 191, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: rounded.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.labelSm,
    color: '#60a5fa',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  productName: {
    ...typography.headlineLg,
    color: '#ffffff',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  counterText: {
    ...typography.bodyMd,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevArrow: {
    position: 'absolute',
    left: spacing.l,
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(10, 10, 12, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  nextArrow: {
    position: 'absolute',
    right: spacing.l,
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(10, 10, 12, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 12, 0.88)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
  },
  thumbnailSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  thumbnailsContent: {
    gap: spacing.s,
  },
  thumbnailWrapper: {
    width: 56,
    height: 56,
    borderRadius: rounded.default,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    opacity: 0.5,
  },
  thumbnailActive: {
    borderColor: '#ffffff',
    opacity: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    ...typography.labelSm,
    color: '#a1a1aa',
    marginBottom: 2,
  },
  priceText: {
    ...typography.headlineLg,
    color: '#ffffff',
    fontWeight: '800',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: rounded.full,
  },
  addToCartBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  addedBtn: {
    backgroundColor: '#10b981', // Success green
  },
});
