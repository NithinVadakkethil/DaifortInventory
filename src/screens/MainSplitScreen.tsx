import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Sidebar } from '../components/Sidebar';
import { ProductCatalogScreen } from './ProductCatalogScreen';
import { CustomersScreen } from './CustomersScreen';
import { OrdersScreen } from './OrdersScreen';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';

export const MainSplitScreen = () => {
  const [activeTab, setActiveTab] = useState('catalog');

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <ProductCatalogScreen />;
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <View style={styles.content}>
        <View style={styles.catalogArea}>
          {renderContent()}
        </View>
        <View style={styles.cartArea}>
          <OrderSummaryPanel />
        </View>
      </View>
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
  },
  cartArea: {
    width: 360,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderColor: colors.surfaceContainer,
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
});
