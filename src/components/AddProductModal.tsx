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
import { X, Plus, Trash2, Image as ImageIcon, Camera, FileText, Upload } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { insertProduct } from '../data/db';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import FastImage from 'react-native-fast-image';

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

  const checkModule = (moduleName: string, fn: any) => {
    if (!fn) {
      Toast.show({
        type: 'error',
        text1: 'Module Not Ready',
        text2: `The ${moduleName} module is not linked. Please rebuild the app with "npx react-native run-ios".`,
      });
      return false;
    }
    return true;
  };

  const handlePickImage = async (index: number) => {
    if (!checkModule('ImagePicker', launchImageLibrary)) return;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        handleImageChange(result.assets[0].uri, index);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick image from library.' });
    }
  };

  const handleTakePhoto = async (index: number) => {
    if (!checkModule('ImagePicker', launchCamera)) return;
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.errorCode === 'camera_unavailable') {
        Toast.show({ type: 'error', text1: 'Camera Unavailable', text2: 'The camera is not available on this device (common in simulators).' });
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        handleImageChange(result.assets[0].uri, index);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open camera.' });
    }
  };

  const handlePickFile = async (index: number) => {
    if (!checkModule('DocumentPicker', DocumentPicker?.pick)) return;
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      if (res && res.length > 0 && res[0].uri) {
        handleImageChange(res[0].uri, index);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Error picking file:', err);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick file.' });
      }
    }
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.absoluteOverlay} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add New Product</Text>
                <Text style={styles.subtitle}>Create a new item in your inventory</Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
              >
                <X size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.formSection}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIcon}>
                      <FileText size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>General Information</Text>
                  </View>
                  
                  {/* Product Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Premium Wireless Headphones"
                      placeholderTextColor={colors.outline}
                    />
                  </View>

                  <View style={styles.row}>
                    {/* Price */}
                    <View style={[styles.inputGroup, { flex: 1 }]}>
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
                    <View style={[styles.inputGroup, { flex: 1.5 }]}>
                      <Text style={styles.label}>Category</Text>
                      <TextInput
                        style={styles.input}
                        value={category}
                        onChangeText={setCategory}
                        placeholder="e.g. Electronics"
                        placeholderTextColor={colors.outline}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.imageSectionHeader}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.sectionIcon}>
                        <ImageIcon size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.sectionTitle}>Product Media</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>Add up to 5 high-quality images. The first one is your thumbnail.</Text>
                  </View>

                  <View style={styles.imageGrid}>
                    {imageUrls.map((url, index) => (
                      <View key={index} style={styles.imageCardContainer}>
                        <View style={styles.imageCard}>
                          {url ? (
                            <View style={styles.imagePreviewContainer}>
                              <FastImage
                                source={{ uri: url }}
                                style={styles.imagePreview}
                                resizeMode={FastImage.resizeMode.cover}
                              />
                              <TouchableOpacity
                                style={styles.removeImageBadge}
                                onPress={() => handleRemoveImageField(index)}
                              >
                                <Trash2 size={12} color={colors.onError} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.imagePlaceholder}>
                              <Upload size={20} color={colors.outline} />
                              <Text style={styles.placeholderText}>Choose Image</Text>
                            </View>
                          )}
                          
                          <View style={styles.imageCardActions}>
                            <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleTakePhoto(index)}>
                              <Camera size={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePickImage(index)}>
                              <ImageIcon size={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePickFile(index)}>
                              <FileText size={16} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <TextInput
                          style={styles.urlInput}
                          value={url}
                          onChangeText={text => handleImageChange(text, index)}
                          placeholder="Or paste URL..."
                          placeholderTextColor={colors.outline}
                          autoCapitalize="none"
                        />
                      </View>
                    ))}

                    {imageUrls.length < 5 && (
                      <TouchableOpacity style={styles.addCardButton} onPress={handleAddImageField}>
                        <View style={styles.addCardCircle}>
                          <Plus size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.addCardText}>Add Slot</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitText}>Save Product</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteOverlay: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    width: 720,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.s,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  formSection: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceContainerLow + '40', // ultra light
    padding: spacing.l,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  imageSectionHeader: {
    marginBottom: spacing.m,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.m,
    marginLeft: 40,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: spacing.m,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    ...typography.bodyMd,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.l,
    marginTop: spacing.s,
  },
  imageCardContainer: {
    width: 140,
  },
  imageCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s,
  },
  placeholderText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.outline,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderTopColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surface,
  },
  cardActionBtn: {
    flex: 1,
    paddingVertical: spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1.5,
    borderRightColor: colors.surfaceContainerHigh,
  },
  urlInput: {
    ...typography.bodyMd,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  addCardButton: {
    width: 140,
    height: 160,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
  },
  addCardCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  addCardText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.l,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: spacing.l,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  submitText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
