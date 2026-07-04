import { AjoTypography } from "@/components/ui/AjoTypography";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Image } from "expo-image";
import { View, StyleSheet } from "react-native";

interface AjoLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'symbol' | 'wordmark' | 'full';
  color?: string;
}

export function AjoLogo({ size = 'medium', variant = 'full', color = colors.primary }: AjoLogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { icon: 24, text: 'body' };
      case 'large': return { icon: 60, text: 'hero' };
      default: return { icon: 40, text: 'sectionHeader' };
    }
  };

  const { icon, text } = getSize();

  const renderSymbol = () => (
   <Image source={require('@/assets/images/ajo-logo.png')} style={{ width: icon, height: icon }} />
  );

  const renderWordmark = () => (
    <AjoTypography variant={text as any} color={color}>
      àjó
    </AjoTypography>
  );

  if (variant === 'symbol') return renderSymbol();
  if (variant === 'wordmark') return renderWordmark();
  return (
    <View style={styles.container}>
      {renderSymbol()}
      {renderWordmark()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});