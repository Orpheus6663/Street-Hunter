import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ActionButton } from '../components/ActionButton';
import { BrandHeader } from '../components/BrandHeader';
import { ScreenFrame } from '../components/ScreenFrame';
import { colors } from '../constants/colors';
import { deletePhoto, savePhotoPermanently } from '../services/camera';
import { getCurrentCoordinates, type Coordinates } from '../services/location';
import { saveDiscovery, type ArtCategory } from '../services/storage';

const categories: ArtCategory[] = ['Grafite', 'Mural', 'Outra'];

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ArtCategory>('Grafite');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState('Buscando sua localização…');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const refreshLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationMessage('Buscando sua localização…');
    try {
      const currentCoordinates = await getCurrentCoordinates();
      setCoordinates(currentCoordinates);
      setLocationMessage('Localização registrada');
    } catch (error) {
      setCoordinates(null);
      setLocationMessage(error instanceof Error ? error.message : 'Não foi possível acessar o GPS.');
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  const enableCamera = async () => {
    setCameraError('');
    if (permission?.granted) {
      setCameraEnabled(true);
      return;
    }

    try {
      const result = await requestPermission();
      if (result.granted) {
        setCameraEnabled(true);
      } else {
        setCameraError('A permissão da câmera foi negada. Permita o acesso para fotografar a arte.');
      }
    } catch {
      setCameraError('Não foi possível acessar a câmera. Tente novamente.');
    }
  };

  const takePhoto = async () => {
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (picture?.uri) setPhotoUri(picture.uri);
      else setCameraError('A câmera não retornou uma fotografia. Tente novamente.');
    } catch {
      setCameraError('Não foi possível tirar a foto. Tente novamente.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Falta o título', 'Digite um título para identificar esta arte.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Falta a fotografia', 'Fotografe a arte antes de salvar.');
      return;
    }
    if (!coordinates) {
      Alert.alert('Localização indisponível', 'Tente obter sua localização novamente antes de salvar.');
      return;
    }

    const id = createId();
    let permanentPhotoUri: string | null = null;
    setSaving(true);
    try {
      permanentPhotoUri = await savePhotoPermanently(photoUri, id);
      await saveDiscovery({
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        photoUri: permanentPhotoUri,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        createdAt: new Date().toISOString(),
      });
      router.replace('/descobertas');
    } catch (error) {
      if (permanentPhotoUri) deletePhoto(permanentPhotoUri);
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const hasCameraPermission = permission?.granted || cameraEnabled;

  return (
    <ScreenFrame activeTab="registrar">
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader compact />
          <View style={styles.stepBadge}><Text style={styles.stepText}>NOVA ARTE</Text></View>
        </View>

        <Text style={styles.pageTitle}>Registrar arte</Text>
        <Text style={styles.subtitle}>Guarde essa descoberta para sempre.</Text>

        <View style={styles.cameraFrame}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.cameraPreview} resizeMode="cover" />
          ) : hasCameraPermission ? (
            <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
          ) : (
            <View style={styles.cameraPrompt}>
              <Text style={styles.cameraPromptIcon}>◎</Text>
              <Text style={styles.cameraPromptTitle}>Sua câmera está pronta?</Text>
              <Text style={styles.cameraPromptText}>Toque abaixo para permitir o acesso e fotografar a arte.</Text>
              <Pressable style={styles.permissionButton} onPress={enableCamera}>
                <Text style={styles.permissionButtonText}>ATIVAR CÂMERA</Text>
              </Pressable>
            </View>
          )}
          {photoUri && (
            <Pressable style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
              <Text style={styles.retakeText}>TIRAR OUTRA</Text>
            </Pressable>
          )}
        </View>

        {hasCameraPermission && !photoUri && (
          <Pressable accessibilityRole="button" style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureOuter}><View style={styles.captureInner} /></View>
            <Text style={styles.captureLabel}>TOQUE PARA FOTOGRAFAR</Text>
          </Pressable>
        )}
        {cameraError ? <Text style={styles.errorText}>{cameraError}</Text> : null}

        <View style={styles.locationCard}>
          <View style={styles.locationIcon}><Text style={styles.locationPin}>●</Text></View>
          <View style={styles.locationCopy}>
            <Text style={styles.fieldLabel}>LOCALIZAÇÃO (GPS)</Text>
            <Text style={styles.locationValue}>
              {coordinates
                ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                : locationMessage}
            </Text>
          </View>
          <Pressable accessibilityRole="button" disabled={loadingLocation} onPress={refreshLocation} style={styles.retryButton}>
            <Text style={styles.retryText}>{loadingLocation ? '…' : '↻'}</Text>
          </Pressable>
        </View>
        {!coordinates && <Text style={styles.gpsError}>{locationMessage}</Text>}

        <Text style={styles.fieldLabel}>TÍTULO DA ARTE *</Text>
        <TextInput
          accessibilityLabel="Título da arte"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex.: Olhar do Futuro"
          placeholderTextColor={colors.gray}
          maxLength={80}
          returnKeyType="next"
        />

        <Text style={styles.fieldLabel}>DESCRIÇÃO (OPCIONAL)</Text>
        <TextInput
          accessibilityLabel="Descrição da arte"
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Conte um pouco sobre a arte…"
          placeholderTextColor={colors.gray}
          multiline
          maxLength={300}
          textAlignVertical="top"
        />

        <Text style={styles.fieldLabel}>CATEGORIA</Text>
        <View style={styles.categoryRow}>
          {categories.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, selected && styles.categorySelected]}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <ActionButton title={saving ? 'Salvando…' : 'Salvar descoberta'} disabled={saving} onPress={handleSave} icon={<Text style={styles.saveIcon}>▣</Text>} />
        <Text style={styles.localNote}>FOTO E INFORMAÇÕES SALVAS SOMENTE NESTE CELULAR</Text>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  stepBadge: { borderWidth: 1, borderColor: colors.green, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  stepText: { color: colors.lime, fontSize: 8, fontWeight: '900', letterSpacing: 1.3 },
  pageTitle: { color: colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: colors.gray, fontSize: 13, marginTop: 4, marginBottom: 16 },
  cameraFrame: { height: 230, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.dark, borderWidth: 1, borderColor: colors.border },
  cameraPreview: { width: '100%', height: '100%' },
  cameraPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  cameraPromptIcon: { color: colors.lime, fontSize: 35, fontWeight: '700', marginBottom: 8 },
  cameraPromptTitle: { color: colors.white, fontSize: 15, fontWeight: '800' },
  cameraPromptText: { color: colors.gray, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 6, maxWidth: 245 },
  permissionButton: { backgroundColor: colors.lime, paddingHorizontal: 17, paddingVertical: 10, borderRadius: 10, marginTop: 13 },
  permissionButtonText: { color: colors.black, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  retakeButton: { position: 'absolute', right: 12, top: 12, borderRadius: 18, backgroundColor: 'rgba(11,11,11,0.8)', paddingHorizontal: 12, paddingVertical: 8 },
  retakeText: { color: colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  captureButton: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  captureOuter: { width: 36, height: 36, borderWidth: 3, borderColor: colors.lime, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 23, height: 23, borderRadius: 12, backgroundColor: colors.lime },
  captureLabel: { color: colors.gray, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  errorText: { color: '#FF8989', fontSize: 11, marginTop: 2, marginBottom: 8 },
  locationCard: { minHeight: 68, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dark, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, marginTop: 8, marginBottom: 9 },
  locationIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#29351B', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  locationPin: { color: colors.lime, fontSize: 18 },
  locationCopy: { flex: 1 },
  fieldLabel: { color: colors.gray, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 10, marginBottom: 6 },
  locationValue: { color: colors.white, fontSize: 12, fontWeight: '600' },
  retryButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: colors.lime, fontSize: 24, fontWeight: '500' },
  gpsError: { color: '#FF8989', fontSize: 10, lineHeight: 14, marginBottom: 2 },
  input: { minHeight: 48, backgroundColor: colors.dark, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, color: colors.white, fontSize: 13 },
  descriptionInput: { minHeight: 76, paddingTop: 12 },
  categoryRow: { flexDirection: 'row', gap: 9 },
  categoryChip: { minHeight: 38, paddingHorizontal: 17, borderRadius: 20, borderColor: colors.border, borderWidth: 1, justifyContent: 'center', backgroundColor: colors.dark },
  categorySelected: { backgroundColor: colors.lime, borderColor: colors.lime },
  categoryText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  categoryTextSelected: { color: colors.black, fontWeight: '900' },
  saveIcon: { color: colors.black, fontSize: 20, fontWeight: '900' },
  localNote: { color: colors.gray, fontSize: 8, fontWeight: '800', textAlign: 'center', letterSpacing: 0.9, marginTop: 14 },
});
