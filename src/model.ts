import * as sqlite from 'sqlite3';

export type DB = sqlite.Database;
export type WallpapersMixed = Array<string | number>;
export type WallpapersList = Array<string>;
export type DBAndWallpapersMixed = {
  db: DB;
  wallpapers: WallpapersMixed;
};
