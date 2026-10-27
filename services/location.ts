import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export async function getCurrentCoordinates(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error('Permissão de localização negada. Permita o acesso para registrar o GPS.');
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('O GPS está desativado. Ative a localização e tente novamente.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
