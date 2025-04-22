import { StyleSheet, Platform } from 'react-native';

// Common component styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // brainrot-bg
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', // brainrot-bg
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

// Animation constants
export const animationConstants = {
  HEADER_HEIGHT: Platform.OS === 'ios' ? 130 : 110,
  SEARCH_BAR_HEIGHT: 70,
};

// Theme colors (matching tailwind config)
export const colors = {
  bg: '#121212',
  card: '#1E1E1E',
  pink: '#fff',
  blue: '#4FCEFF',
  purple: '#8F5AFF',
  yellow: '#FFD166',
  orange: '#FF9B4F',
};

export default {
  commonStyles,
  animationConstants,
  colors,
}; 