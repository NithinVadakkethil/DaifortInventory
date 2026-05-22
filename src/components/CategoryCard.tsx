import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Settings, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography, rounded, shadows } from '../theme';
import { CategoryRecord } from '../data/db';

interface CategoryCardProps {
  category: CategoryRecord;
  onPress: (category: CategoryRecord) => void;
  onManagePress: (category: CategoryRecord) => void;
}

export const CategoryCard = React.memo(({ category, onPress, onManagePress }: CategoryCardProps) => {
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category)}
      activeOpacity={0.92}
    >
      <View style={styles.imageContainer}>
        {hasImageError ? (
          <View style={[styles.image, styles.errorImage]}>
            <ImageIcon color={colors.outline} size={32} />
          </View>
        ) : (
          <>
            <FastImage
              style={styles.image}
              source={{
                uri: category.image,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onLoadStart={() => setIsLoadingImage(true)}
              onLoadEnd={() => setIsLoadingImage(false)}
              onError={() => {
                setIsLoadingImage(false);
                setHasImageError(true);
              }}
            />
            {isLoadingImage && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={(e) => {
            e.stopPropagation();
            onManagePress(category);
          }}
          activeOpacity={0.7}
        >
          <Settings size={14} color={colors.primary} strokeWidth={2.5} />
          <Text style={styles.manageText}>Manage Products</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    flex: 1,
    margin: spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  errorImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  details: {
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.titleMd,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: rounded.full,
    backgroundColor: 'rgba(0, 91, 191, 0.08)',
    marginTop: spacing.xs,
  },
  manageText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
});
