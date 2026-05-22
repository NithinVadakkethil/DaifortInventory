import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, Plus, Edit2, Trash2, Camera, Image as ImageIcon, FileText, Upload, ChevronLeft } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { colors, spacing, typography, rounded, shadows } from '../theme';
import { getDBConnection, getProductImages, deleteProduct, insertProduct, updateProduct } from '../data/db';
import { Product } from '../hooks/useProducts';

interface ManageProductsModalProps {
  visible: boolean;
  categoryName: string;
  onClose: () => void;
  onRefreshCatalog?: () => void;
}

type ModalMode = 'list' | 'add' | 'edit';

export const ManageProductsModal = ({
  visible,
  categoryName,
  onClose,
  onRefreshCatalog,
}: ManageProductsModalProps) => {
  const [mode, setMode] = useState<ModalMode>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Form states for Add/Edit
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Fetch products inside this category
  const fetchCategoryProducts = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDBConnection();
      let query = 'SELECT * FROM products WHERE category = ?';
      const params: any[] = [categoryName];

      if (search.trim()) {
        query += ' AND name LIKE ?';
        params.push(`%${search.trim()}%`);
      }

      const [results] = await db.executeSql(query, params);
      const items: Product[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        const galleryImages = await getProductImages(db, row.id);
        items.push({
          ...row,
          images: galleryImages.length > 0 ? galleryImages : (row.image ? [row.image] : []),
        });
      }
      setProducts(items);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryName, search]);

  useEffect(() => {
    if (visible && mode === 'list') {
      fetchCategoryProducts();
    }
  }, [visible, mode, fetchCategoryProducts]);

  const handleClose = () => {
    setMode('list');
    setSearch('');
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setProdName('');
    setProdPrice('');
    setProdImage('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setMode('add');
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdImage(product.image);
    setMode('edit');
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
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setProdImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakePhoto = async () => {
    if (!checkModule('ImagePicker', launchCamera)) return;
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setProdImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePickFile = async () => {
    if (!checkModule('DocumentPicker', DocumentPicker?.pick)) return;
    try {
      const res = await DocumentPicker.pick({ type: [DocumentPicker.types.images] });
      if (res && res.length > 0 && res[0].uri) {
        setProdImage(res[0].uri);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.error(err);
    }
  };

  const handleDelete = (productId: number) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(productId);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Product deleted.' });
            fetchCategoryProducts();
            if (onRefreshCatalog) onRefreshCatalog();
          } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete product.' });
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!prodName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Product name is required.' });
      return;
    }
    const parsedPrice = parseFloat(prodPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Enter a valid price.' });
      return;
    }
    if (!prodImage.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Product image is required.' });
      return;
    }

    try {
      if (mode === 'add') {
        await insertProduct(prodName.trim(), parsedPrice, categoryName, prodImage.trim(), 100, []);
        Toast.show({ type: 'success', text1: 'Success', text2: 'Product added.' });
      } else if (mode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, prodName.trim(), parsedPrice, categoryName, prodImage.trim(), 100, []);
        Toast.show({ type: 'success', text1: 'Success', text2: 'Product updated.' });
      }
      setMode('list');
      resetForm();
      fetchCategoryProducts();
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save product.' });
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
              <View style={styles.headerLeft}>
                {mode !== 'list' && (
                  <TouchableOpacity style={styles.backBtn} onPress={() => setMode('list')}>
                    <ChevronLeft size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={styles.title}>
                    {mode === 'list' && `Products in ${categoryName}`}
                    {mode === 'add' && 'Add Product'}
                    {mode === 'edit' && 'Edit Product'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {mode === 'list' && 'Manage category inventory items'}
                    {mode !== 'list' && `Assigning to category: ${categoryName}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {mode === 'list' ? (
              <>
                <View style={styles.actionBar}>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search products..."
                    placeholderTextColor={colors.outline}
                    value={search}
                    onChangeText={setSearch}
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
                    <Plus size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Add Product</Text>
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                ) : (
                  <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No products found in this category.</Text>
                    }
                    renderItem={({ item }) => (
                      <View style={styles.itemRow}>
                        <FastImage source={{ uri: item.image }} style={styles.itemImage} resizeMode={FastImage.resizeMode.cover} />
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.rowBtn} onPress={() => handleOpenEdit(item)}>
                            <Edit2 size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.rowBtn} onPress={() => handleDelete(item.id)}>
                            <Trash2 size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                )}
              </>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={prodName}
                    onChangeText={setProdName}
                    placeholder="e.g. Classic Mug"
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price (£) *</Text>
                  <TextInput
                    style={styles.input}
                    value={prodPrice}
                    onChangeText={setProdPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.outline}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Image *</Text>
                  <View style={styles.imagePickerRow}>
                    <View style={styles.imageCard}>
                      {prodImage ? (
                        <FastImage source={{ uri: prodImage }} style={styles.imagePreview} resizeMode={FastImage.resizeMode.cover} />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Upload size={24} color={colors.outline} />
                          <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.pickerActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={handleTakePhoto}>
                        <Camera size={16} color={colors.primary} />
                        <Text style={styles.actionBtnText}>Take Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={handlePickImage}>
                        <ImageIcon size={16} color={colors.primary} />
                        <Text style={styles.actionBtnText}>From Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={handlePickFile}>
                        <FileText size={16} color={colors.primary} />
                        <Text style={styles.actionBtnText}>Select File</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TextInput
                    style={styles.urlInput}
                    value={prodImage}
                    onChangeText={setProdImage}
                    placeholder="Or paste image URL here..."
                    placeholderTextColor={colors.outline}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
                  <Text style={styles.submitText}>Save Product</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    width: 680,
    height: 580,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  backBtn: {
    padding: spacing.s,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
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
  actionBar: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    color: colors.onSurface,
    backgroundColor: colors.background,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
  },
  addBtnText: {
    ...typography.labelMd,
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.l,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: rounded.default,
    marginRight: spacing.m,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.titleMd,
    color: colors.onSurface,
  },
  itemPrice: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  rowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingBottom: spacing.m,
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
    borderRadius: 12,
    padding: spacing.m,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    ...typography.bodyMd,
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: spacing.l,
    marginBottom: spacing.s,
  },
  imageCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
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
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pickerActions: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: 8,
    paddingHorizontal: spacing.m,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLow,
  },
  actionBtnText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  urlInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: spacing.m,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    ...typography.bodyMd,
    fontSize: 11,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  submitText: {
    ...typography.labelMd,
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
