import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '../components/ActionButton';
import { BrandHeader } from '../components/BrandHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import { colors } from '../constants/colors';

function WallArtwork() {
  return (
    <View style={styles.artPanel}>
      <View style={styles.paintSplashOne} />
      <View style={styles.paintSplashTwo} />
      <View style={styles.paintSplashThree} />
      <Text style={styles.crown}>♛</Text>
      <Text style={styles.street}>STREET</Text>
      <Text style={styles.hunter}>HUNTER</Text>
      <View style={styles.cameraBadge}><Text style={styles.cameraIcon}>◉</Text></View>
      <Text style={styles.panelCaption}>ARTE URBANA ESTÁ EM TODO LUGAR</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenFrame activeTab="inicio">
      <View style={styles.container}>
        <BrandHeader />
        <WallArtwork />
        <Text style={styles.title}>Sua próxima{ '\n' }descoberta está{ '\n' }na rua.</Text>
        <Text style={styles.description}>
          Explore a cidade. Fotografe as artes. Colecione suas descobertas.
        </Text>
        <View style={styles.actions}>
          <ActionButton title="Registrar arte" onPress={() => router.push('/registrar')} icon={<Text style={styles.buttonIcon}>◎</Text>} />
          <ActionButton title="Minhas descobertas" secondary onPress={() => router.push('/descobertas')} icon={<Text style={[styles.buttonIcon, styles.secondaryIcon]}>▦</Text>} />
        </View>
        <View style={styles.noteRow}>
          <View style={styles.noteLine} />
          <Text style={styles.note}>SUAS FOTOS FICAM SALVAS NO CELULAR</Text>
        </View>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20 },
  artPanel: {
    height: 220,
    backgroundColor: '#151515',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginTop: 28,
    marginBottom: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  paintSplashOne: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: colors.green, opacity: 0.14, top: -60, right: -32 },
  paintSplashTwo: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: colors.lime, opacity: 0.12, bottom: -25, left: -10 },
  paintSplashThree: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime, opacity: 0.85, top: 42, right: 70 },
  crown: { color: colors.lime, fontSize: 24, lineHeight: 28, marginLeft: 4, marginBottom: 1 },
  street: { color: colors.white, fontSize: 47, lineHeight: 47, fontWeight: '900', fontStyle: 'italic', letterSpacing: -3, transform: [{ rotate: '-3deg' }] },
  hunter: { color: colors.lime, fontSize: 43, lineHeight: 46, fontWeight: '900', fontStyle: 'italic', letterSpacing: -2, transform: [{ rotate: '-3deg' }] },
  cameraBadge: { position: 'absolute', right: 27, top: 86, width: 54, height: 54, borderWidth: 2, borderColor: colors.white, borderRadius: 15, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '8deg' }] },
  cameraIcon: { color: colors.white, fontSize: 32, lineHeight: 36, fontWeight: '700' },
  panelCaption: { position: 'absolute', left: 25, bottom: 17, color: colors.gray, fontSize: 8, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: colors.white, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7 },
  description: { color: '#C2C2C2', fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 310 },
  actions: { marginTop: 15 },
  buttonIcon: { color: colors.black, fontSize: 24, lineHeight: 26, fontWeight: '900' },
  secondaryIcon: { color: colors.lime },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  noteLine: { width: 25, height: 2, backgroundColor: colors.lime, marginRight: 9 },
  note: { color: colors.gray, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
});
