import { openConnection, getWallpapers, closeConnection } from './database';
import { filterWallpapers } from './wallpapers';

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
