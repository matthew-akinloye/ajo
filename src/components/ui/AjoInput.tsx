// components/ui/AjoInput.tsx
import { colors } from '@/theme/colors';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

export interface AjoInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  showLeftIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const AjoInput: React.FC<AjoInputProps> = ({
  label,
  required = false,
  placeholder,
  value,
  onChangeText,
  error,
  leftIcon,
  showLeftIcon = true,
  containerStyle,
  inputWrapperStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const renderLeftIcon = () => {
    if (!showLeftIcon) return null;
    return leftIcon;
  };

  // Determine border color based on error and focus
  let borderColor = colors.border;
  if (error) {
    borderColor = colors.error;
  } else if (isFocused) {
    borderColor = colors.primary;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.inputWrapper,
          inputWrapperStyle,
          { borderColor },
          !editable && styles.inputDisabled,
        ]}
      >
        {renderLeftIcon() && <View style={styles.leftIconContainer}>{renderLeftIcon()}</View>}
        <TextInput
          style={[styles.input, inputStyle, !editable && styles.inputDisabled]}
          placeholder={placeholder}
          placeholderTextColor="rgba(154, 172, 159, 1)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...restProps}
        />
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    textAlign: 'left',
    color: colors.textPrimary,
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
  },
  requiredStar: {
    color: colors.error,
    fontSize: 10,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 0,
    minHeight: 48, // fixed minimum height to prevent collapse
    width: '100%',
  },
  leftIconContainer: {
    flexShrink: 0,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48, // explicit height to ensure it always has size
    textAlign: 'left',
    color: colors.textPrimary,
    fontFamily: 'Poppins',
    fontSize: 10.819672584533691,
    fontWeight: '400',
    lineHeight: 16.229507446289062,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  errorText: {
    textAlign: 'left',
    color: colors.error,
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default AjoInput;