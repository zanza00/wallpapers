import { TaskEither, taskify } from 'fp-ts/lib/TaskEither';
import { exec } from 'child_process';

const command =
  "sqlite3 '/Users/simonepicciani/Library/Application Support/Dock/desktoppicture.db' 'select value from data;'";

export interface ExecResult {
  stdout: Buffer | string;
  stderr: Buffer | string;
}
const execTask = taskify(
  (
    command: string,
    cb: (e: Error | null | undefined, r?: ExecResult) => void,
  ) => {
    exec(command, (err, stdout, stderr) => cb(err, { stdout, stderr }));
  },
);

function program(command: string): TaskEither<Error, string[]> {
  return execTask(command).map(({ stdout }) => {
    let res;
    if (Buffer.isBuffer(stdout)) {
      res = stdout.toString('utf8');
    } else {
      res = stdout;
    }

    return res
      .split('\n')
      .filter(
        x => x.length > 1 && x !== '1' && x !== '900.0' && !x.startsWith('~'),
      );
  });
}

function main(): void {
  program(command)
    .map(x => {
      console.log('printing current wallpapers')
      x.forEach(item => {
        console.log(item);
      });
    })
    .mapLeft(err => {
      console.error('ERROR!!', JSON.stringify(err));
    })
    .run();
}

main();
