import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

interface Props {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const HEIGHT: Record<ButtonSize, number> = { md: 48, sm: 36 };

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      android_ripple={{ color: variantStyle.rippleColor }}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], paddingHorizontal: size === "sm" ? spacing.md : spacing.lg },
        variantStyle.container,
        isDisabled && styles.disabledContainer,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color as string} size="small" />
      ) : (
        <RowContent icon={icon} color={isDisabled ? colors.disabledText : (variantStyle.text.color as string)}>
          <Text
            style={[
              typography.bodyMedium,
              variantStyle.text,
              isDisabled && styles.disabledText,
              size === "sm" && styles.smText,
            ]}
          >
            {title}
          </Text>
        </RowContent>
      )}
    </Pressable>
  );
}

function RowContent({
  icon,
  color,
  children,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  color: string;
  children: ReactNode;
}) {
  if (!icon) return <>{children}</>;
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={color} />
      {children}
    </View>
  );
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: StyleProp<ViewStyle>; text: { color: string }; rippleColor: string }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
    rippleColor: colors.primaryPressed,
  },
  secondary: {
    container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
    text: { color: colors.textStrong },
    rippleColor: colors.divider,
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: colors.primary },
    rippleColor: colors.primaryTint,
  },
  danger: {
    container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.danger },
    text: { color: colors.danger },
    rippleColor: colors.dangerTint,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  disabledContainer: {
    backgroundColor: colors.disabledBg,
    borderColor: colors.disabledBg,
  },
  disabledText: {
    color: colors.disabledText,
  },
  smText: {
    fontSize: 13,
  },
});
