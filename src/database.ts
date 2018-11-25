import * as sqlite from 'sqlite3';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { DB, DBAndWallpapersMixed, WallpapersMixed } from './model';

export function openConnection(path: string): TaskEither<string, DB> {
  const prom: Promise<sqlite.Database> = new Promise((resolve, reject) => {
    const db = new sqlite.Database(path, err => {
      if (err) {
        return reject(err.message);
      }
    });
    return resolve(db);
  });
  return tryCatch(() => prom, reason => reason).mapLeft(err => err.toString());
}

export function getWallpapers(
  db: sqlite.Database,
): TaskEither<string, DBAndWallpapersMixed> {
  const sqlCommand = `select value from data;`;
  const prom: Promise<DBAndWallpapersMixed> = new Promise((resolve, reject) => {
    db.all(sqlCommand, [], (err, rows) => {
      if (err) {
        return reject(err.message);
      }
      return resolve({ wallpapers: rows.map(({ value }) => value), db });
    });
  });
  return tryCatch(() => prom, reason => reason).mapLeft(err => err.toString());
}

export function closeConnection({ db, wallpapers }: DBAndWallpapersMixed) {
  const prom: Promise<WallpapersMixed> = new Promise((resolve, reject) => {
    db.close(err => {
      if (err) {
        return reject(err.message);
      }
      return resolve(wallpapers);
    });
  });
  return tryCatch(() => prom, reason => reason).mapLeft(err => err.toString());
}
