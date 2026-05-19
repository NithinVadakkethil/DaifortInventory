import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { Sidebar } from '../components/Sidebar';
import { ProductCatalogScreen } from './ProductCatalogScreen';
import { CustomersScreen } from './CustomersScreen';
import { OrdersScreen } from './OrdersScreen';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';
import { useCartStore } from '../store/useCartStore';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const MainSplitScreen = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [isCartOpen, setIsCartOpen] = useState(true);
  
  // Track total items in cart to display in floating handle badge when closed
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleCart = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCartOpen(!isCartOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <ProductCatalogScreen isCartOpen={isCartOpen} />;
      case 'customers':
        return <CustomersScreen />;
      case 'orders':
        return <OrdersScreen />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.catalogArea}>
          {renderContent()}
        </View>
        <View style={[styles.cartArea, !isCartOpen && styles.cartAreaClosed]}>
          {isCartOpen && <OrderSummaryPanel />}
        </View>
      </View>

      {/* Floating Glassmorphic Navigation Pill (Absolute Positioned on left) */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Cart Sliding Handle Badge (Absolute Positioned relative to main viewport) */}
      <TouchableOpacity
        style={[
          styles.floatingHandle,
          isCartOpen ? { right: 360 } : { right: 0 },
        ]}
        onPress={toggleCart}
        activeOpacity={0.85}
      >
        {isCartOpen ? (
          <ChevronRight color={colors.onPrimary} size={24} strokeWidth={2.5} />
        ) : (
          <View style={styles.cartIconWrapper}>
            <ShoppingBag color={colors.onPrimary} size={20} strokeWidth={2.5} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  catalogArea: {
    flex: 1,
    paddingTop: spacing.m,
    paddingLeft: 16, // Recovered horizontal space for true edge-to-edge layout!
  },
  cartArea: {
    width: 360,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  cartAreaClosed: {
    width: 0,
    borderLeftWidth: 0,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.headlineMd,
    color: colors.onSurfaceVariant,
  },
  floatingHandle: {
    position: 'absolute',
    top: '48%',
    width: 46,
    height: 76,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    
    // Smooth sliding shadows
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cartIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
});
