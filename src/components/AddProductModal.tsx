import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { insertProduct } from '../data/db';
import Toast from 'react-native-toast-message';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal = ({ visible, onClose, onSuccess }: AddProductModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const handleAddImageField = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const handleRemoveImageField = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (text: string, index: number) => {
    setImageUrls(prev => prev.map((url, i) => (i === index ? text : url)));
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setImageUrls(['']);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const filledImages = imageUrls.map(u => u.trim()).filter(u => u.length > 0);

    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Product name is required.' });
      return;
    }
    if (!price.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Price is required.' });
      return;
    }
    if (filledImages.length === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'At least one image URL is required.' });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Price must be a valid number.' });
      return;
    }

    try {
      const primaryImage = filledImages[0];
      const additionalImages = filledImages.slice(1);
      await insertProduct(name.trim(), priceNum, category.trim() || 'Uncategorized', primaryImage, 100, additionalImages);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Product added successfully.' });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add product.' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add New Product</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Product Name */}
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

                {/* Price */}
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

                {/* Category */}
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

                {/* Multi-Image URLs */}
                <View style={styles.inputGroup}>
                  <View style={styles.imageSectionHeader}>
                    <View style={styles.imageLabelRow}>
                      <ImageIcon size={16} color={colors.primary} />
                      <Text style={styles.label}>
                        Product Images *{' '}
                        <Text style={styles.labelHint}>(first image = thumbnail)</Text>
                      </Text>
                    </View>
                  </View>

                  {imageUrls.map((url, index) => (
                    <View key={index} style={styles.imageRow}>
                      <View style={styles.imageIndexBadge}>
                        <Text style={styles.imageIndexText}>{index + 1}</Text>
                      </View>
                      <TextInput
                        style={[styles.input, styles.imageInput]}
                        value={url}
                        onChangeText={text => handleImageChange(text, index)}
                        placeholder={`https://example.com/image-${index + 1}.jpg`}
                        placeholderTextColor={colors.outline}
                        autoCapitalize="none"
                        keyboardType="url"
                      />
                      {imageUrls.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImageField(index)}
                        >
                          <Trash2 size={18} color={colors.error ?? '#E53935'} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Add Image Button */}
                  <TouchableOpacity style={styles.addImageButton} onPress={handleAddImageField}>
                    <Plus size={16} color={colors.primary} />
                    <Text style={styles.addImageText}>Add Another Image</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitText}>Save Product</Text>
                </TouchableOpacity>
              </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 520,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: rounded.xl,
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
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
  scrollContent: {
    paddingBottom: spacing.s,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  imageSectionHeader: {
    marginBottom: spacing.s,
  },
  imageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  labelHint: {
    ...typography.labelSm,
    color: colors.outline,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: rounded.default,
    padding: spacing.m,
    color: colors.onSurface,
    ...typography.bodyMd,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  imageIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: rounded.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  imageIndexText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  imageInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeImageButton: {
    padding: spacing.xs,
    flexShrink: 0,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: rounded.default,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  addImageText: {
    ...typography.labelMd,
    color: colors.primary,
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
