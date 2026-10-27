import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.compactMark]}>
        <Text style={[styles.markText, compact && styles.compactMarkText]}>SH</Text>
      </View>
      <View>
        <Text style={[styles.name, compact && styles.compactName]}>
          STREET <Text style={styles.lime}>HUNTER</Text>
        </Text>
        {!compact && <Text style={styles.tagline}>ARTE URBANA • SUAS DESCOBERTAS</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mark: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    marginRight: 12,
  },
  compactMark: { width: 36, height: 36, borderRadius: 10, marginRight: 9 },
  markText: { color: colors.black, fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  compactMarkText: { fontSize: 13 },
  name: { color: colors.white, fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.7 },
  compactName: { fontSize: 14 },
  lime: { color: colors.lime },
  tagline: { color: colors.gray, fontSize: 8, fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },
});
