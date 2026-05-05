import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, TouchableWithoutFeedback, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { insertProduct } from '../data/db';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal = ({ visible, onClose, onSuccess }: AddProductModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      Alert.alert('Error', 'Please fill in Name, Price, and Image URL.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      Alert.alert('Error', 'Price must be a valid number.');
      return;
    }

    try {
      await insertProduct(name, priceNum, category || 'Uncategorized', image, 100);
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setPrice('');
      setCategory('');
      setImage('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add product.');
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
                <Text style={styles.title}>Add New Product</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter product name"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price (£) *</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.outline}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={category}
                    onChangeText={setCategory}
                    placeholder="e.g. Electronics"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Image URL *</Text>
                  <TextInput
                    style={styles.input}
                    value={image}
                    onChangeText={setImage}
                    placeholder="https://example.com/image.jpg"
                    placeholderTextColor={colors.outline}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitText}>Save Product</Text>
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
