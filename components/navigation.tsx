import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors } from '../constants/colors';

type TabKey = 'inicio' | 'registrar' | 'descobertas';

const tabs: { key: TabKey; label: string; icon: string; route: '/' | '/registrar' | '/descobertas' }[] = [
  { key: 'inicio', label: 'Início', icon: '⌂', route: '/' },
  { key: 'registrar', label: 'Registrar', icon: '+', route: '/registrar' },
  { key: 'descobertas', label: 'Galeria', icon: '▦', route: '/descobertas' },
];

export function BottomNav({ activeTab }: { activeTab?: TabKey }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = activeTab ? activeTab === tab.key : pathname === tab.route;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={tab.key}
            onPress={() => router.push(tab.route)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={[styles.icon, active && styles.activeText]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 66,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  item: { minWidth: 76, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
  pressed: { opacity: 0.65 },
  icon: { color: colors.gray, fontSize: 21, lineHeight: 25, fontWeight: '700' },
  label: { color: colors.gray, fontSize: 10, fontWeight: '700', marginTop: 2 },
  activeText: { color: colors.lime },
});
