// Note: We use system fonts as fallbacks if custom fonts are not linked yet.
export const typography = {
  headlineXl: {
    fontFamily: 'Manrope-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  headlineLg: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  headlineMd: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.28, // 0.02em of 14px
  },
  labelSm: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.48, // 0.04em of 12px
  },
};
