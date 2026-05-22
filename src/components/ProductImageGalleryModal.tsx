import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { X, Image as ImageIcon, ShoppingCart, ChevronLeft, ChevronRight, Check, Settings, Minus, Plus } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { Product } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { getDBConnection, getProductImages } from '../data/db';
import { ManageProductsModal } from './ManageProductsModal';

interface ProductImageGalleryModalProps {
  categoryName: string | null;
  visible: boolean;
  onClose: () => void;
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
  categoryName,
  visible,
  onClose,
}: ProductImageGalleryModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  // Custom price and qty states
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityText, setQuantityText] = useState<string>('1');

  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch products inside the selected category
  const fetchProducts = useCallback(async () => {
    if (!categoryName) return;
    setLoading(true);
    try {
      const db = await getDBConnection();
      const [results] = await db.executeSql(
        'SELECT * FROM products WHERE category = ?',
        [categoryName]
      );
      const items: Product[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const gallery = await getProductImages(db, row.id);
        items.push({
          ...row,
          images: gallery.length > 0 ? gallery : (row.image ? [row.image] : []),
        });
      }
      setProducts(items);
    } catch (error) {
      console.error('Failed to fetch category products:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    if (visible && categoryName) {
      fetchProducts();
      setActiveIndex(0);
      setQuantity(1);
      setNegotiatedPrice('');
    }
  }, [visible, categoryName, fetchProducts]);

  // Current active product
  const activeProduct = products[activeIndex] || null;

  // Check if active product is already in the cart
  const cartItem = activeProduct
    ? cartItems.find((item) => item.product.id === activeProduct.id)
    : null;
  const isInCart = !!cartItem;

  // Initialize/Update states when active product changes or when cart changes
  useEffect(() => {
    if (activeProduct) {
      if (cartItem) {
        setQuantity(cartItem.quantity);
        setNegotiatedPrice(
          cartItem.negotiatedPrice !== undefined
            ? cartItem.negotiatedPrice.toString()
            : activeProduct.price.toString()
        );
      } else {
        setQuantity(1);
        setNegotiatedPrice(activeProduct.price.toString());
      }
    }
  }, [activeProduct, cartItem]);

  // Sync quantityText state with quantity
  useEffect(() => {
    setQuantityText(quantity.toString());
  }, [quantity]);

  const handleQuantityTextChange = (text: string) => {
    setQuantityText(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed);
    }
  };

  const handleQuantityTextBlur = () => {
    const parsed = parseInt(quantityText, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setQuantityText(quantity.toString());
    } else {
      setQuantity(parsed);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / windowWidth);
    if (index !== activeIndex && index >= 0 && index < products.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < products.length - 1) {
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
    if (!activeProduct) return;
    const priceNum = parseFloat(negotiatedPrice);
    const finalPrice = isNaN(priceNum) || priceNum < 0 ? activeProduct.price : priceNum;
    
    // Add (or update) item in cart
    addItem(
      {
        id: activeProduct.id,
        name: activeProduct.name,
        price: activeProduct.price,
        image: activeProduct.image,
        stock: activeProduct.stock,
      },
      quantity,
      finalPrice
    );
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  if (!visible) return null;

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
        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No products inside this category.</Text>
            <TouchableOpacity
              style={styles.manageBtnInline}
              onPress={() => setIsManageOpen(true)}
            >
              <Settings size={16} color="#fff" />
              <Text style={styles.manageBtnInlineText}>Manage Products</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtnEmpty} onPress={onClose}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Fullscreen Swipable Product Images (Only showing images as requested) */}
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              decelerationRate="fast"
              style={styles.imageScroll}
              contentContainerStyle={{ width: windowWidth * products.length, height: windowHeight }}
            >
              {products.map((p, index) => (
                <GalleryImage
                  key={`${p.id}-${index}`}
                  uri={p.image}
                  width={windowWidth}
                  height={windowHeight}
                  onTapImage={toggleControls}
                />
              ))}
            </ScrollView>

            {/* Floating Header Bar */}
            {showControls && activeProduct && (
              <View style={[styles.headerPanel, { paddingTop: Math.max(insets.top, spacing.m) }]}>
                <View style={styles.headerLeft}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{categoryName}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {activeProduct.name}
                  </Text>
                </View>
                
                <View style={styles.headerRight}>
                  {products.length > 1 && (
                    <Text style={styles.counterText}>
                      Product {activeIndex + 1} of {products.length}
                    </Text>
                  )}
                  
                  <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => setIsManageOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Settings size={18} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                    <X size={22} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Floating Side Arrow Controls */}
            {showControls && products.length > 1 && activeIndex > 0 && (
              <TouchableOpacity style={styles.prevArrow} onPress={handlePrev} activeOpacity={0.7}>
                <ChevronLeft size={28} color="#ffffff" />
              </TouchableOpacity>
            )}
            {showControls && products.length > 1 && activeIndex < products.length - 1 && (
              <TouchableOpacity style={styles.nextArrow} onPress={handleNext} activeOpacity={0.7}>
                <ChevronRight size={28} color="#ffffff" />
              </TouchableOpacity>
            )}

            {/* Floating Bottom Control Panel */}
            {showControls && activeProduct && (
              <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
                
                {/* Price Customization & Bargaining Form */}
                <View style={styles.customizationForm}>
                  
                  {/* Original vs Negotiated Display */}
                  <View style={styles.priceMetaBlock}>
                    <Text style={styles.metaLabel}>Original Price</Text>
                    <Text style={styles.originalPriceText}>£{activeProduct.price.toFixed(2)}</Text>
                  </View>

                  {/* Unit Price Edit Input */}
                  <View style={styles.inputBlock}>
                    <Text style={styles.metaLabel}>Unit Price (£)</Text>
                    <View style={styles.textInputWrapper}>
                      <TextInput
                        style={styles.negotiatedInput}
                        keyboardType="decimal-pad"
                        value={negotiatedPrice}
                        onChangeText={setNegotiatedPrice}
                        placeholder={activeProduct.price.toFixed(2)}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                      />
                    </View>
                  </View>

                  {/* Quantity Stepper */}
                  <View style={styles.qtyBlock}>
                    <Text style={styles.metaLabel}>Quantity</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        <Minus size={16} color="#ffffff" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.qtyValInput}
                        keyboardType="number-pad"
                        value={quantityText}
                        onChangeText={handleQuantityTextChange}
                        onBlur={handleQuantityTextBlur}
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => q + 1)}
                      >
                        <Plus size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Bottom Row - Add/Update Button */}
                <View style={styles.actionRow}>
                  <View style={styles.finalPriceContainer}>
                    <Text style={styles.finalPriceLabel}>Line Total</Text>
                    <Text style={styles.finalPriceText}>
                      £{(
                        (parseFloat(negotiatedPrice) || activeProduct.price) * quantity
                      ).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.addToCartBtn, isInCart && styles.addedBtn]}
                    onPress={handleAddToCart}
                    activeOpacity={0.8}
                  >
                    {isInCart ? (
                      <>
                        <Check size={20} color="#ffffff" />
                        <Text style={styles.addToCartBtnText}>Update Cart</Text>
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
          </>
        )}
      </View>

      {/* Embedded Product Management Modal */}
      {categoryName && (
        <ManageProductsModal
          visible={isManageOpen}
          categoryName={categoryName}
          onClose={() => setIsManageOpen(false)}
          onRefreshCatalog={fetchProducts}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.m,
  },
  emptyText: {
    ...typography.headlineMd,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  manageBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  manageBtnInlineText: {
    ...typography.labelMd,
    color: '#fff',
    fontWeight: '700',
  },
  closeBtnEmpty: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(10, 10, 12, 0.75)',
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
    gap: spacing.m,
  },
  counterText: {
    ...typography.bodyMd,
    color: '#a1a1aa',
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(10, 10, 12, 0.92)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
  },
  customizationForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.l,
    gap: spacing.l,
  },
  priceMetaBlock: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  metaLabel: {
    ...typography.labelSm,
    color: '#a1a1aa',
    marginBottom: spacing.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  originalPriceText: {
    ...typography.headlineMd,
    color: '#ef4444',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  inputBlock: {
    flex: 1.5,
  },
  textInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.m,
  },
  negotiatedInput: {
    height: 48,
    color: '#ffffff',
    ...typography.bodyMd,
    fontWeight: '700',
  },
  qtyBlock: {
    flex: 1.2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.xs,
    height: 48,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValText: {
    ...typography.titleMd,
    color: '#ffffff',
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  qtyValInput: {
    ...typography.titleMd,
    color: '#ffffff',
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
    padding: 0,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: spacing.m,
  },
  finalPriceContainer: {
    flexDirection: 'column',
  },
  finalPriceLabel: {
    ...typography.labelSm,
    color: '#a1a1aa',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  finalPriceText: {
    ...typography.headlineLg,
    color: '#10b981',
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
