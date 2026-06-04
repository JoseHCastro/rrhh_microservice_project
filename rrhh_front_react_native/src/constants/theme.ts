/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  primary: {
    100: '#E8F2FF',
    200: '#A1CEFF',
    300: '#13ABFF',
    400: '#0284C7', // Base
    500: '#015F91',
    600: '#003C5F',
    700: '#001D30',
  },
  complementary: {
    100: '#FFDCD7',
    200: '#FFA495',
    300: '#FF6229',
    400: '#C74502', // Base
    500: '#8D2E01',
    600: '#571900',
    700: '#260700',
  },
  gray: {
    100: '#F0F1F1',
    200: '#C7CACD',
    300: '#A0A3A7',
    400: '#7B7E81',
    500: '#585B5D',
    600: '#38393B',
    700: '#1A1B1C',
  },
} as const;

export const Colors = {
  light: {
    text: Palette.gray[700],
    background: '#ffffff',
    backgroundElement: Palette.gray[100],
    backgroundSelected: Palette.gray[200],
    textSecondary: Palette.gray[500],
    primary: Palette.primary[400],
    complementary: Palette.complementary[400],
  },
  dark: {
    text: Palette.gray[100],
    background: '#000000',
    backgroundElement: Palette.gray[600],
    backgroundSelected: Palette.gray[500],
    textSecondary: Palette.gray[300],
    primary: Palette.primary[400],
    complementary: Palette.complementary[400],
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
