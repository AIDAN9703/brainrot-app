import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  textClassName = '',
}: ButtonProps) {
  // Base classes
  let buttonClasses = '';
  let textClasses = 'font-serif font-medium';
  
  // Size classes
  if (size === 'small') {
    buttonClasses += ' px-3 py-2 rounded-lg';
    textClasses += ' text-sm';
  } else if (size === 'medium') {
    buttonClasses += ' px-4 py-3 rounded-xl';
    textClasses += ' text-base';
  } else if (size === 'large') {
    buttonClasses += ' px-6 py-4 rounded-xl';
    textClasses += ' text-lg';
  }
  
  // Variant classes
  if (variant === 'primary') {
    buttonClasses += ' bg-brainrot-pink';
    textClasses += ' text-white';
  } else if (variant === 'secondary') {
    buttonClasses += ' bg-brainrot-purple';
    textClasses += ' text-white';
  } else if (variant === 'outline') {
    buttonClasses += ' bg-transparent border-2 border-brainrot-yellow';
    textClasses += ' text-brainrot-yellow';
  } else if (variant === 'text') {
    buttonClasses += ' bg-transparent';
    textClasses += ' text-brainrot-blue';
  }
  
  // Disabled state
  if (disabled) {
    buttonClasses += ' opacity-50';
  }
  
  // Add custom classes
  buttonClasses += ` ${className}`;
  textClasses += ` ${textClassName}`;
  
  // Icon size based on button size
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  
  // Icon color based on variant
  const iconColor = 
    variant === 'primary' ? 'white' : 
    variant === 'secondary' ? 'white' : 
    variant === 'outline' ? colors.yellow : 
    colors.blue;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${buttonClasses}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon as any} size={iconSize} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text className={textClasses}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon as any} size={iconSize} color={iconColor} style={{ marginLeft: 8 }} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
} 