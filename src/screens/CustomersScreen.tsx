import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useCustomers } from '../hooks/useCustomers';
import { colors, spacing, typography, rounded, shadows } from '../theme';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { Edit2, Plus, Search, Trash2, User } from 'lucide-react-native';
import { CustomerType } from '../store/useCustomerStore';
import { deleteCustomer } from '../data/db';
import Toast from 'react-native-toast-message';

export const CustomersScreen = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { customers, loading, refetch } = useCustomers(debouncedSearch);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleEditPress = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setEditModalVisible(true);
  };

  const handleDeletePress = (customer: CustomerType) => {
    Alert.alert('Delete Customer', `Delete ${customer.name} and all related orders?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomer(customer.id);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Customer deleted successfully.',
            });
            refetch();
          } catch (error) {
            console.error(error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete customer.',
            });
          }
        },
      },
    ]);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedCustomer(null);
  };

  const emptyText = useMemo(() => {
    if (search.trim().length > 0) {
      return 'No customers match your search.';
    }
    return 'No customers found. Add your first customer.';
  }, [search]);

  const formatLastOrder = (customer: CustomerType) => {
    if (!customer.lastOrderDate) {
      return 'Last order: No orders yet';
    }
    const date = new Date(customer.lastOrderDate).toLocaleString();
    const total = typeof customer.lastOrderTotal === 'number' ? ` - $${customer.lastOrderTotal.toFixed(2)}` : '';
    return `Last order: ${date}${total}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={20} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>Add Customer</Text>
        </TouchableOpacity>
      </View>

      <AddCustomerModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={refetch}
      />
      <EditCustomerModal
        visible={isEditModalVisible}
        customer={selectedCustomer}
        onClose={closeEditModal}
        onSuccess={refetch}
      />

      <View style={styles.searchContainer}>
        <Search color={colors.outline} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer by name, email, or phone..."
          placeholderTextColor={colors.outline}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <View style={styles.customerIconContainer}>
                <User size={24} color={colors.primary} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.name}</Text>
                {item.email ? <Text style={styles.customerDetail}>{item.email}</Text> : null}
                {item.phone ? <Text style={styles.customerDetail}>{item.phone}</Text> : null}
                <Text style={styles.lastOrderText}>{formatLastOrder(item)}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleEditPress(item)}>
                  <Edit2 size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDeletePress(item)}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
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
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginLeft: spacing.s,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.md,
    marginRight: spacing.s,
    ...shadows.sm,
  },
  addButtonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    marginLeft: spacing.xs,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.xxl,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.l,
    marginBottom: spacing.m,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  customerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: rounded.full,
    backgroundColor: 'rgba(0, 91, 191, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.l,
  },
  customerInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    backgroundColor: colors.background,
  },
  customerName: {
    ...typography.titleMd,
    color: colors.onSurface,
    marginBottom: 4,
    fontWeight: '600',
  },
  customerDetail: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  lastOrderText: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: spacing.s,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
