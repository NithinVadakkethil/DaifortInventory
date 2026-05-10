import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, TouchableWithoutFeedback, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { updateCustomer } from '../data/db';
import Toast from 'react-native-toast-message';
import { CustomerType } from '../store/useCustomerStore';

interface EditCustomerModalProps {
  visible: boolean;
  customer: CustomerType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditCustomerModal = ({ visible, customer, onClose, onSuccess }: EditCustomerModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a name.',
      });
      return;
    }
    
    if (!customer) return;

    try {
      await updateCustomer(customer.id, name, email, phone, address);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Customer updated successfully.',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update customer.',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <KeyboardAvoidingView 
          style={styles.overlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Edit Customer</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Customer Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.outline}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(555) 555-5555"
                    placeholderTextColor={colors.outline}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter full address"
                    placeholderTextColor={colors.outline}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  form: {
    marginTop: spacing.s,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: rounded.default,
    padding: spacing.m,
    color: colors.onSurface,
    ...typography.bodyMd,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: rounded.default,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  submitText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
});
