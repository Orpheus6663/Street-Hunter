import * as SQLite from 'expo-sqlite';
import { deletePhoto } from './camera';

export type ArtCategory = 'Grafite' | 'Mural' | 'Outra';

export type Discovery = {
  id: string;
  title: string;
  description: string;
  category: ArtCategory;
  photoUri: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('street-hunter.db').then(async (database) => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS discoveries (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL,
          photo_uri TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      return database;
    }).catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function fromRow(row: {
  id: string;
  title: string;
  description: string;
  category: ArtCategory;
  photo_uri: string;
  latitude: number;
  longitude: number;
  created_at: string;
}): Discovery {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    photoUri: row.photo_uri,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

export async function saveDiscovery(discovery: Discovery): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO discoveries
      (id, title, description, category, photo_uri, latitude, longitude, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    discovery.id,
    discovery.title,
    discovery.description,
    discovery.category,
    discovery.photoUri,
    discovery.latitude,
    discovery.longitude,
    discovery.createdAt,
  );
}

export async function getDiscoveries(): Promise<Discovery[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    title: string;
    description: string;
    category: ArtCategory;
    photo_uri: string;
    latitude: number;
    longitude: number;
    created_at: string;
  }>('SELECT * FROM discoveries ORDER BY created_at DESC;');

  return rows.map(fromRow);
}

export async function getDiscovery(id: string): Promise<Discovery | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: string;
    title: string;
    description: string;
    category: ArtCategory;
    photo_uri: string;
    latitude: number;
    longitude: number;
    created_at: string;
  }>('SELECT * FROM discoveries WHERE id = ?;', id);

  return row ? fromRow(row) : null;
}

export async function removeDiscovery(id: string): Promise<void> {
  const database = await getDatabase();
  const discovery = await getDiscovery(id);
  await database.runAsync('DELETE FROM discoveries WHERE id = ?;', id);
  if (discovery) deletePhoto(discovery.photoUri);
}
