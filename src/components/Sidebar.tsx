import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Store, Users, FileText, Settings, LogOut } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';

const NAV_ITEMS = [
  { id: 'catalog', label: 'Catalog', icon: Store, active: true },
  { id: 'customers', label: 'Customers', icon: Users, active: false },
  { id: 'orders', label: 'Orders', icon: FileText, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
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
                size={24}
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem}>
          <LogOut size={24} color={colors.onSurfaceVariant} />
          <Text style={styles.navLabel}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: spacing.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderColor: colors.surfaceContainer,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.s,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: rounded.default,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
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
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.default,
    marginBottom: spacing.xs,
  },
  navItemActive: {
    backgroundColor: colors.primaryContainer, // light blue background
  },
  navLabel: {
    ...typography.bodyMd,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginLeft: spacing.m,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.surfaceContainer,
    paddingTop: spacing.m,
  },
});
