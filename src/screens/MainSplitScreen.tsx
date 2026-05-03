import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { Sidebar } from '../components/Sidebar';
import { ProductCatalogScreen } from './ProductCatalogScreen';
import { OrderSummaryPanel } from '../components/OrderSummaryPanel';

export const MainSplitScreen = () => {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <View style={styles.catalogArea}>
          <ProductCatalogScreen />
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
});
