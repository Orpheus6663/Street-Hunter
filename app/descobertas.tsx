import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import { colors } from '../constants/colors';
import { getDiscoveries, type ArtCategory, type Discovery } from '../services/storage';

const filters: Array<'Todas' | ArtCategory> = ['Todas', 'Grafite', 'Mural', 'Outra'];

function coordinatesLabel(item: Discovery): string {
  return `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`;
}

export default function DiscoveriesScreen() {
  const router = useRouter();
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [filter, setFilter] = useState<'Todas' | ArtCategory>('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');
      getDiscoveries()
        .then((items) => { if (active) setDiscoveries(items); })
        .catch(() => { if (active) setError('Não foi possível carregar suas descobertas. Tente novamente.'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );
  const visibleDiscoveries = filter === 'Todas'
    ? discoveries
    : discoveries.filter((item) => item.category === filter);
  const discoveryRows: Discovery[][] = [];
  for (let index = 0; index < visibleDiscoveries.length; index += 2) {
    discoveryRows.push(visibleDiscoveries.slice(index, index + 2));
  }

  const renderCard = (item: Discovery) => (
    <Pressable
      accessibilityRole="button"
      key={item.id}
      onPress={() => router.push({ pathname: '/detalhe/[id]', params: { id: item.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image source={{ uri: item.photoUri }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>⌖ {coordinatesLabel(item)}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenFrame activeTab="descobertas">
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader compact />
          <Text style={styles.count}>{discoveries.length.toString().padStart(2, '0')}</Text>
        </View>
        <Text style={styles.pageTitle}>Minhas descobertas</Text>
        <Text style={styles.subtitle}>Um pedaço da cidade, guardado por você.</Text>

        {!loading && discoveries.length > 0 && (
          <View style={styles.filters}>
            {filters.map((item) => {
              const selected = filter === item;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterChip, selected && styles.filterSelected]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item === 'Outra' ? 'Outras' : item === 'Todas' ? 'Todas' : item}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {loading ? (
          <View style={styles.centerState}><ActivityIndicator color={colors.lime} /><Text style={styles.stateText}>Carregando suas artes…</Text></View>
        ) : error ? (
          <View style={styles.centerState}><Text style={styles.stateText}>{error}</Text></View>
        ) : discoveries.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>▦</Text></View>
            <Text style={styles.emptyTitle}>Ainda não há descobertas</Text>
            <Text style={styles.emptyText}>Quando encontrar uma arte pela cidade, fotografe e salve aqui.</Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push('/registrar')}>
              <Text style={styles.emptyButtonText}>REGISTRAR PRIMEIRA ARTE</Text>
            </Pressable>
          </View>
        ) : (
          visibleDiscoveries.length === 0 ? (
            <View style={styles.filteredEmpty}><Text style={styles.stateText}>Nenhuma arte nesta categoria ainda.</Text></View>
          ) : (
            <View style={styles.grid}>
              {discoveryRows.map((row) => (
                <View key={row[0].id} style={styles.cardRow}>
                  {row.map(renderCard)}
                  {row.length === 1 && <View style={styles.cardPlaceholder} />}
                </View>
              ))}
            </View>
          )
        )}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  count: { color: colors.lime, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  pageTitle: { color: colors.white, fontSize: 27, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.gray, fontSize: 12, marginTop: 5, marginBottom: 20 },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  filterChip: { minHeight: 34, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.dark, justifyContent: 'center' },
  filterSelected: { backgroundColor: colors.lime, borderColor: colors.lime },
  filterText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  filterTextSelected: { color: colors.black, fontWeight: '900' },
  centerState: { minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  stateText: { color: colors.gray, textAlign: 'center', fontSize: 13, marginTop: 12, lineHeight: 20 },
  emptyCard: { minHeight: 310, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, marginTop: 18 },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#29351B', alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  emptyIconText: { color: colors.lime, fontSize: 31, fontWeight: '600' },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.gray, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 8, maxWidth: 255 },
  emptyButton: { backgroundColor: colors.lime, minHeight: 43, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 19 },
  emptyButtonText: { color: colors.black, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  grid: { paddingBottom: 16 },
  cardRow: { justifyContent: 'space-between', marginBottom: 13 },
  cardPlaceholder: { width: '48.4%' },
  card: { width: '48.4%', overflow: 'hidden', backgroundColor: colors.dark, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  cardPressed: { opacity: 0.8 },
  cardImage: { width: '100%', height: 150, backgroundColor: '#303030' },
  cardContent: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 },
  category: { color: colors.lime, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.white, fontSize: 13, fontWeight: '800', marginTop: 5 },
  cardMeta: { color: colors.gray, fontSize: 10, marginTop: 5 },
  cardLocation: { color: '#C2C2C2', fontSize: 9, marginTop: 6 },
  filteredEmpty: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
});
