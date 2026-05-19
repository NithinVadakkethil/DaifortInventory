import React, { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Search, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useOrders } from '../hooks/useOrders';
import { deleteOrder } from '../data/db';
import { colors, rounded, spacing, typography, shadows } from '../theme';

export const OrdersScreen = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { orders, loading, refetch } = useOrders(debouncedSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleDeletePress = (orderId: number) => {
    Alert.alert('Delete Order', `Are you sure you want to delete order #${orderId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrder(orderId);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Order deleted successfully.',
            });
            refetch();
          } catch (error) {
            console.error(error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete order.',
            });
          }
        },
      },
    ]);
  };

  const emptyText = search.trim().length > 0 
    ? 'No orders match your search.'
    : 'No orders found.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={colors.outline} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders by ID or customer name..."
          placeholderTextColor={colors.outline}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{emptyText}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                  <Text style={styles.orderTotal}>£{item.total.toFixed(2)}</Text>
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
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePress(item.id)}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    marginBottom: spacing.l,
    marginTop: spacing.m,
    paddingLeft: 320, // Keep space for absolute top-left horizontal navbar
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginLeft: spacing.s,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.s,
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: 52,
    color: colors.onSurface,
    ...typography.bodyMd,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingRight: spacing.m,
  },
  orderId: {
    ...typography.titleMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  orderTotal: {
    ...typography.titleMd,
    color: colors.primary,
    fontWeight: '600',
  },
  orderMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.m,
    backgroundColor: colors.background,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
