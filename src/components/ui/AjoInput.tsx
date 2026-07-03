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
import { Svg, Path } from 'react-native-svg';

export interface AjoInputProps extends Omit<TextInputProps, 'style'> {
  /** Label text displayed above the input */
  label?: string;
  /** Whether the field is required (adds a red asterisk) */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Callback when text changes */
  onChangeText?: (text: string) => void;
  /** Error message to display below the input */
  error?: string;
  /** Custom left icon component (defaults to profile SVG) */
  leftIcon?: React.ReactNode;
  /** Whether to show the left icon (defaults to true) */
  showLeftIcon?: boolean;
  /** Override container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Override input wrapper style (the bordered box) */
  inputWrapperStyle?: StyleProp<ViewStyle>;
  /** Override label style */
  labelStyle?: StyleProp<TextStyle>;
  /** Override input text style */
  inputStyle?: StyleProp<TextStyle>;
  /** Override error text style */
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

  // Default left icon (profile SVG)
  const defaultIcon = (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M10.1331 9.05817C10.0498 9.04984 9.9498 9.04984 9.85814 9.05817C7.8748 8.9915 6.2998 7.3665 6.2998 5.3665C6.2998 3.32484 7.9498 1.6665 9.9998 1.6665C12.0415 1.6665 13.6998 3.32484 13.6998 5.3665C13.6915 7.3665 12.1165 8.9915 10.1331 9.05817Z"
        stroke="#9AAC9F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.9666 12.1335C3.94993 13.4835 3.94993 15.6835 5.9666 17.0252C8.25827 18.5585 12.0166 18.5585 14.3083 17.0252C16.3249 15.6752 16.3249 13.4752 14.3083 12.1335C12.0249 10.6085 8.2666 10.6085 5.9666 12.1335Z"
        stroke="#9AAC9F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const renderLeftIcon = () => {
    if (!showLeftIcon) return null;
    return leftIcon || defaultIcon;
  };

  // Determine border color based on error and focus
  let borderColor = 'rgba(207, 207, 207, 1)';
  if (error) {
    borderColor = 'rgba(253, 78, 97, 1)'; // error red
  } else if (isFocused) {
    borderColor = 'rgba(3, 117, 35, 1)'; // primary green
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
        <View style={styles.leftIconContainer}>{renderLeftIcon()}</View>
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
    flexShrink: 0,
    display: 'flex',
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
    color: 'rgba(1, 35, 10, 1)',
    fontFamily: 'Poppins',
    fontSize: 10.819672584533691,
    fontWeight: '500',
    lineHeight: 16.229507446289062,
  },
  requiredStar: {
    color: 'rgba(253, 78, 97, 1)',
    fontSize: 10.819672584533691,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(207, 207, 207, 1)',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  leftIconContainer: {
    flexShrink: 0,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    textAlign: 'left',
    color: 'rgba(1, 35, 10, 1)',
    fontFamily: 'Poppins',
    fontSize: 10.819672584533691,
    fontWeight: '400',
    lineHeight: 16.229507446289062,
    paddingVertical: 0,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  errorText: {
    textAlign: 'left',
    color: 'rgba(253, 78, 61, 1)',
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default AjoInput;