import * as restify from 'restify';

import { openConnection, getWallpapers, closeConnection } from './database';
import { filterWallpapers } from './wallpapers';

const config = {
  dbPath:
    '/Users/simonepicciani/Library/Application Support/Dock/desktoppicture.db',
  path: '/Users/simonepicciani/Dropbox (Personal)/IFTTT/reddit/wallpapers',
};

function statusHandler(
  req: restify.Request,
  res: restify.Response,
  next: restify.Next,
) {
  res.send('OK');
  next();
}

function wallpapersHandler(
  req: restify.Request,
  res: restify.Response,
  next: restify.Next,
) {
  openConnection(config.dbPath)
    .chain(getWallpapers)
    .chain(closeConnection)
    .map(filterWallpapers)
    .fold(
      l => {
        console.error(l);
        next(new Error(l));
      },
      wallpapers => {
        res.send({
          path: config.path,
          wallpapers,
        });
        next();
      },
    )
    .run();
}

function main(): void {
  const server = restify.createServer();

  server.get('/status', statusHandler);
  server.get('/wallpapers', wallpapersHandler);

  server.get(
    '/',
    restify.plugins.serveStatic({
      directory: './build/web',
      default: 'index.html',
    }),
  );

  server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}

main();
