import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import * as sqlite from 'sqlite3';
import {
  DB,
  DBAndWallpapersMixed,
  WallpapersMixed,
  WallpapersList,
} from './model';

// const getWallpaperCommand = (path: string, wp: string) => `${path}/${wp}`;

// const openWallpaperCommand = (wp: string) =>
//   `open "/Users/simonepicciani/Dropbox (Personal)/IFTTT/reddit/wallpapers/${wp}"`;

function openConnection(path: string): TaskEither<string, DB> {
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

function getWallpapers(
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

function closeConnection({ db, wallpapers }: DBAndWallpapersMixed) {
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

function filterWallpapers(stdout: WallpapersMixed): WallpapersList {
  return stdout
    .filter((e: any): e is string => typeof e === 'string')
    .filter(
      x => x.length > 1 && x !== '1' && x !== '900.0' && !x.startsWith('~'),
    );
}

function main(): void {
  const dbPath =
    '/Users/simonepicciani/Library/Application Support/Dock/desktoppicture.db';
  openConnection(dbPath)
    .chain(getWallpapers)
    .chain(closeConnection)
    .map(filterWallpapers)
    .fold(l => console.error(l), a => console.log(a))
    .run();
}

main();
