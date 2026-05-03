import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, rounded } from '../theme';

export const LoginScreen = ({ navigation }: any) => {
  const handleLogin = () => {
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to Daifort Wholesale</Text>
        
        {/* Placeholder for inputs */}
        <View style={styles.inputPlaceholder} />
        <View style={styles.inputPlaceholder} />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In (Offline)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: rounded.lg,
    width: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.l,
  },
  inputPlaceholder: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: rounded.default,
    marginBottom: spacing.m,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: rounded.default,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  buttonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
});
