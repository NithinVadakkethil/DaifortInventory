import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    // Simulate loading time for DB init
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daifort</Text>
      <Text style={styles.subtitle}>Wholesale Order Manager</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headlineXl,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    opacity: 0.8,
  },
});
