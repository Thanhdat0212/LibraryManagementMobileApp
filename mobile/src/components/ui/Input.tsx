import { forwardRef, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInput as RNTextInput,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const Input = forwardRef<RNTextInput, Props>(function Input(
  { label, error, leftIcon, rightElement, containerStyle, style, ...rest },
  ref,
) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          rest.multiline && styles.fieldMultiline,
          error && styles.fieldError,
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={colors.textPlaceholder} style={styles.leftIcon} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          placeholderTextColor={colors.textPlaceholder}
          textAlignVertical={rest.multiline ? "top" : "center"}
          style={[styles.input, typography.body, rest.multiline && styles.inputMultiline, style]}
          {...rest}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  label: {
    ...typography.bodyMedium,
    color: colors.textBody,
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  fieldMultiline: {
    minHeight: 88,
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  leftIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: colors.textStrong,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 72,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
