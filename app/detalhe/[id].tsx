import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { BrandHeader } from '../../components/BrandHeader';
import { ScreenFrame } from '../../components/ScreenFrame';
import { colors } from '../../constants/colors';
import { getDiscovery, removeDiscovery, type Discovery } from '../../services/storage';

export default function DiscoveryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!id) return;
      setLoading(true);
      getDiscovery(id)
        .then((item) => { if (active) setDiscovery(item); })
        .catch(() => { if (active) setError('Não foi possível carregar esta descoberta.'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [id]),
  );

  const askToDelete = () => {
    if (!discovery) return;
    Alert.alert('Excluir descoberta?', 'A foto e os dados serão removidos deste celular.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void removeDiscovery(discovery.id)
            .then(() => router.replace('/descobertas'))
            .catch(() => Alert.alert('Erro', 'Não foi possível excluir esta descoberta.'));
        },
      },
    ]);
  };

  return (
    <ScreenFrame activeTab="descobertas">
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <BrandHeader compact />
          <View style={styles.headerSpacer} />
        </View>
        {loading ? (
          <View style={styles.state}><ActivityIndicator color={colors.lime} /></View>
        ) : error || !discovery ? (
          <View style={styles.state}><Text style={styles.message}>{error || 'Esta descoberta não foi encontrada.'}</Text></View>
        ) : (
          <>
            <Image source={{ uri: discovery.photoUri }} style={styles.photo} resizeMode="cover" />
            <Text style={styles.category}>{discovery.category.toUpperCase()} • ARTE URBANA</Text>
            <Text style={styles.title}>{discovery.title}</Text>
            <Text style={styles.date}>REGISTRADA EM {new Date(discovery.createdAt).toLocaleDateString('pt-BR')}</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationMark}>⌖</Text>
              <View>
                <Text style={styles.fieldLabel}>LOCALIZAÇÃO GPS</Text>
                <Text style={styles.locationValue}>{discovery.latitude.toFixed(6)}, {discovery.longitude.toFixed(6)}</Text>
              </View>
            </View>
            {discovery.description ? (
              <View style={styles.descriptionCard}>
                <Text style={styles.fieldLabel}>SOBRE ESTA ARTE</Text>
                <Text style={styles.description}>{discovery.description}</Text>
              </View>
            ) : null}
            <Pressable accessibilityRole="button" onPress={askToDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>EXCLUIR DESCOBERTA</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 23 },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  backText: { color: colors.lime, fontSize: 35, lineHeight: 38 },
  headerSpacer: { width: 36 },
  photo: { width: '100%', height: 340, backgroundColor: colors.dark, borderRadius: 18 },
  category: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginTop: 19 },
  title: { color: colors.white, fontSize: 27, fontWeight: '900', marginTop: 6 },
  date: { color: colors.gray, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginTop: 7 },
  locationCard: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.dark, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, marginTop: 18 },
  locationMark: { color: colors.lime, fontSize: 23 },
  fieldLabel: { color: colors.gray, fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginBottom: 5 },
  locationValue: { color: colors.white, fontSize: 12, fontWeight: '600' },
  descriptionCard: { backgroundColor: colors.dark, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 15, marginTop: 11 },
  description: { color: colors.white, fontSize: 13, lineHeight: 20 },
  deleteButton: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: '#713838', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  deleteText: { color: '#FF8989', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { color: colors.gray, fontSize: 13, textAlign: 'center' },
});
