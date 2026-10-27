import { Directory, File, Paths } from 'expo-file-system';

const photosDirectory = new Directory(Paths.document, 'street-hunter-photos');

export async function savePhotoPermanently(sourceUri: string, id: string): Promise<string> {
  photosDirectory.create({ idempotent: true, intermediates: true });

  const source = new File(sourceUri);
  const destination = new File(photosDirectory, `${id}.jpg`);
  await source.copy(destination);
  return destination.uri;
}

export function deletePhoto(uri: string): void {
  const file = new File(uri);
  if (file.exists) file.delete();
}
