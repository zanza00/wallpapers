import { WallpapersMixed, WallpapersList } from './model';

// const getWallpaperCommand = (path: string, wp: string) => `${path}/${wp}`;
// const openWallpaperCommand = (wp: string) =>
//   `open "/Users/simonepicciani/Dropbox (Personal)/IFTTT/reddit/wallpapers/${wp}"`;

export function filterWallpapers(stdout: WallpapersMixed): WallpapersList {
  return stdout
    .filter((e: any): e is string => typeof e === 'string')
    .filter(
      x => x.length > 1 && x !== '1' && x !== '900.0' && !x.startsWith('~'),
    );
}
