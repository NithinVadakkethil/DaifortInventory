import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Search, X, User } from 'lucide-react-native';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerStore, CustomerType } from '../store/useCustomerStore';
import { colors, spacing, typography, rounded } from '../theme';
import { AddCustomerModal } from './AddCustomerModal';
import { Plus } from 'lucide-react-native';

interface CustomerSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomerSelector = ({ visible, onClose }: CustomerSelectorProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { customers, loading, refetch } = useCustomers(debouncedSearch);
  const selectCustomer = useCustomerStore((state) => state.selectCustomer);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSelect = (customer: CustomerType) => {
    selectCustomer(customer);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Customer</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setAddModalVisible(true)}
                  >
                    <Plus size={20} color={colors.onPrimary} />
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={24} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>

              <AddCustomerModal
                visible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSuccess={refetch}
              />

              <View style={styles.searchContainer}>
                <Search color={colors.outline} size={18} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search customer..."
                  placeholderTextColor={colors.outline}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {loading ? (
                <Text style={styles.loadingText}>Loading customers...</Text>
              ) : (
                <FlatList
                  data={customers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.customerItem}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.avatar}>
                        <User size={24} color={colors.onPrimary} />
                      </View>
                      <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{item.name}</Text>
                        <Text style={styles.customerEmail}>{item.email}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.list}
                  ListEmptyComponent={<Text style={styles.loadingText}>No customers found.</Text>}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 500,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: rounded.xl,
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: rounded.default,
    marginRight: spacing.m,
  },
  addText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    marginLeft: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    borderRadius: rounded.default,
    paddingHorizontal: spacing.s,
    marginBottom: spacing.m,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: colors.onSurface,
  },
  list: {
    flexGrow: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: rounded.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  customerEmail: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
