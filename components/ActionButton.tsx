import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export function ActionButton({ title, onPress, secondary = false, disabled = false, icon }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
      <Text style={[styles.arrow, secondary && styles.secondaryLabel]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: colors.lime,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  secondary: { backgroundColor: colors.dark, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  icon: { marginRight: 12 },
  label: { flex: 1, color: colors.black, fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
  secondaryLabel: { color: colors.white },
  arrow: { color: colors.black, fontSize: 25, lineHeight: 27, fontWeight: '500' },
});
