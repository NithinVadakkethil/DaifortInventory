import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Store, Users, FileText } from 'lucide-react-native';
import { colors, spacing, typography, rounded, shadows } from '../theme';

const NAV_ITEMS = [
  { id: 'catalog', label: 'Catalog', icon: Store, active: true },
  { id: 'customers', label: 'Customers', icon: Users, active: false },
  { id: 'orders', label: 'Orders', icon: FileText, active: false },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.brandName}>Daifort</Text>
      </View>

      <View style={styles.navContainer}>
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
            >
              <Icon
                size={22}
                color={isActive ? colors.primary : colors.onSurfaceVariant}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: spacing.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadows.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xs,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: rounded.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
    ...shadows.sm,
  },
  logoText: {
    ...typography.headlineMd,
    color: colors.onPrimary,
  },
  brandName: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.md,
    marginBottom: spacing.s,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 91, 191, 0.08)', // very light primary
  },
  navLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.m,
  },
  navLabelActive: {
    color: colors.primary,
  },
});
