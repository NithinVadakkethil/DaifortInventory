import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { X, User } from 'lucide-react-native';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerStore, CustomerType } from '../store/useCustomerStore';
import { colors, spacing, typography, rounded } from '../theme';

interface CustomerSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomerSelector = ({ visible, onClose }: CustomerSelectorProps) => {
  const { customers, loading } = useCustomers();
  const selectCustomer = useCustomerStore((state) => state.selectCustomer);

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
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
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
  closeButton: {
    padding: spacing.xs,
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
