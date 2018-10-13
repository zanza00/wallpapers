import { TaskEither, taskify, tryCatch } from 'fp-ts/lib/TaskEither';
import { exec } from 'child_process';
import * as inquirer from 'inquirer';
import * as sqlite from 'sqlite3';

const getWallpapersCommand =
  "sqlite3 '/Users/simonepicciani/Library/Application Support/Dock/desktoppicture.db' 'select value from data;'";

const openWallpaperCommand = (wp: string) =>
  `open "/Users/simonepicciani/Dropbox (Personal)/IFTTT/reddit/wallpapers/${wp}"`;

export interface ExecResult {
  stdout: Buffer | string;
  stderr: Buffer | string;
}

function sqliteConnect() {
  const db = new sqlite.Database(
    '/Users/simonepicciani/Library/Application Support/Dock/desktoppicture.db',
    err => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the in-memory SQlite database.');
    },
  );
  const sql = `select value from data;`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.map(({ value }) => value).forEach(row => {
      console.log(row);
    });
  });

  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

const execTask = taskify(
  (
    command: string,
    cb: (e: Error | null | undefined, r?: ExecResult) => void,
  ) => {
    exec(command, (err, stdout, stderr) => cb(err, { stdout, stderr }));
  },
);

function execTE(command: string): TaskEither<Error, string> {
  return execTask(command).map(({ stdout }) => {
    let res;
    if (Buffer.isBuffer(stdout)) {
      res = stdout.toString('utf8');
    } else {
      res = stdout;
    }
    return res;
  });
}

const spawnInquirerPrompt = (
  choices: string[],
): TaskEither<Error, { wallpaper: string }> =>
  tryCatch(
    () =>
      inquirer.prompt({
        type: 'list',
        choices,
        message: 'Chose wallpaper',
        name: 'wallpaper',
        pageSize: 15,
      }),
    err => ({ name: 'Inquirer Error', message: `${err}` }),
  );

function splitAndFilter(stdout: string): string[] {
  return stdout
    .split('\n')
    .filter(
      x => x.length > 1 && x !== '1' && x !== '900.0' && !x.startsWith('~'),
    );
}

function main(): void {
  execTE(getWallpapersCommand)
    .map(splitAndFilter)
    .chain(spawnInquirerPrompt)
    .chain(({ wallpaper }) =>
      execTE(openWallpaperCommand(wallpaper)).map(() => wallpaper),
    )
    .fold(
      err => console.error('ERROR!!', JSON.stringify(err)),
      res => console.log(`Successfuly opened ${res}`),
    )
    .run();
}

if (false) {
  main();
}
sqliteConnect();
