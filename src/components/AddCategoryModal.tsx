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
import { X, Camera, Image as ImageIcon, FileText, Upload } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { insertCategory } from '../data/db';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import FastImage from 'react-native-fast-image';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCategoryModal = ({ visible, onClose, onSuccess }: AddCategoryModalProps) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const resetForm = () => {
    setName('');
    setImage('');
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
        text2: `The ${moduleName} module is not linked.`,
      });
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    if (!checkModule('ImagePicker', launchImageLibrary)) return;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick image.' });
    }
  };

  const handleTakePhoto = async () => {
    if (!checkModule('ImagePicker', launchCamera)) return;
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });
      if (result.errorCode === 'camera_unavailable') {
        Toast.show({ type: 'error', text1: 'Camera Unavailable', text2: 'Camera is not available.' });
        return;
      }
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open camera.' });
    }
  };

  const handlePickFile = async () => {
    if (!checkModule('DocumentPicker', DocumentPicker?.pick)) return;
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      if (res && res.length > 0 && res[0].uri) {
        setImage(res[0].uri);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking file:', err);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick file.' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Category name is required.' });
      return;
    }
    if (!image.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Category image is required.' });
      return;
    }

    try {
      await insertCategory(name.trim(), image.trim());
      Toast.show({ type: 'success', text1: 'Success', text2: 'Category created successfully.' });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create category.' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.absoluteOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Create New Category</Text>
                <Text style={styles.subtitle}>Add a new category classification to your catalog</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Category Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Dinner Ware"
                  placeholderTextColor={colors.outline}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Category Image *</Text>
                <View style={styles.imagePickerRow}>
                  <View style={styles.imageCard}>
                    {image ? (
                      <View style={styles.imagePreviewContainer}>
                        <FastImage source={{ uri: image }} style={styles.imagePreview} resizeMode={FastImage.resizeMode.cover} />
                      </View>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Upload size={24} color={colors.outline} />
                        <Text style={styles.placeholderText}>Choose Image</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.pickerActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleTakePhoto}>
                      <Camera size={18} color={colors.primary} />
                      <Text style={styles.actionBtnText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handlePickImage}>
                      <ImageIcon size={18} color={colors.primary} />
                      <Text style={styles.actionBtnText}>From Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handlePickFile}>
                      <FileText size={18} color={colors.primary} />
                      <Text style={styles.actionBtnText}>Select File</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TextInput
                  style={styles.urlInput}
                  value={image}
                  onChangeText={setImage}
                  placeholder="Or paste image URL here..."
                  placeholderTextColor={colors.outline}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                <Text style={styles.submitText}>Save Category</Text>
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
    width: 600,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
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
    paddingBottom: spacing.s,
  },
  formSection: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.s,
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
  imagePickerRow: {
    flexDirection: 'row',
    gap: spacing.l,
    marginBottom: spacing.m,
  },
  imageCard: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pickerActions: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.s,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: 10,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLow,
  },
  actionBtnText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  urlInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: spacing.m,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    ...typography.bodyMd,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.l,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  submitText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
