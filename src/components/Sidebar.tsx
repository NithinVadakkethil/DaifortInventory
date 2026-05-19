import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Store, Users, FileText } from 'lucide-react-native';
import { colors, spacing, typography, rounded, shadows } from '../theme';

const NAV_ITEMS = [
  { id: 'catalog', label: 'Catalog', icon: Store },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orders', label: 'Orders', icon: FileText },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              isActive && styles.navItemActive,
            ]}
            onPress={() => onTabChange(item.id)}
            activeOpacity={0.7}
          >
            <Icon
              size={18}
              color={isActive ? colors.primary : colors.onSurfaceVariant}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navLabel,
                isActive && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    top: 32,
    width: 300,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Elegant transparent glassmorphism base
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)', // Glossy glass outline border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.s,
    zIndex: 1000,

    // Ambient glassmorphic shadows for premium depth layer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 91, 191, 0.08)', // Soft primary tint on active item
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: colors.primary,
  },
});
