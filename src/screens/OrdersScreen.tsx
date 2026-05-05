import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useOrders } from '../hooks/useOrders';
import { colors, rounded, spacing, typography } from '../theme';

export const OrdersScreen = () => {
  const { orders, loading } = useOrders();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders (Last 24 Hours)</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders in the last 24 hours.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.orderMeta}>
                Customer: {item.customerName ? item.customerName : 'Walk-in Customer'}
              </Text>
              <Text style={styles.orderMeta}>
                Date: {new Date(item.date).toLocaleString()}
              </Text>
              <Text style={styles.orderMeta}>
                Status: {item.status ? item.status : 'N/A'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.s,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.m,
    marginLeft: spacing.s,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.xxl,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: rounded.default,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  orderId: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  orderTotal: {
    ...typography.labelMd,
    color: colors.primary,
  },
  orderMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
