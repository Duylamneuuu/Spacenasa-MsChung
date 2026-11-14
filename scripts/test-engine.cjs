const { spawnSync } = require('node:child_process');
const { mkdtempSync, realpathSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const project = path.resolve(__dirname, '..');
const compiler = require.resolve('typescript/bin/tsc');
const cache = realpathSync(path.join(project, 'node_modules')); // gitignored
const output = mkdtempSync(path.join(cache, '.expedition-test-'));

function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, { cwd: project, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

try {
  process.exitCode = run([
    compiler, '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node',
    '--lib', 'ES2022', '--strict', '--skipLibCheck', '--noEmitOnError',
    '--rootDir', 'src', '--outDir', output, 'src/sim/expedition.ts',
  ]);
  if (process.exitCode === 0) {
    // The source project is ESM; the isolated compiler output is CommonJS.
    writeFileSync(path.join(output, 'package.json'), '{"type":"commonjs"}\n');
    process.exitCode = run(['--test', 'tests/expedition.test.cjs'], {
      ...process.env,
      EXPEDITION_TEST_BUILD: output,
    });
  }
} finally {
  const target = realpathSync(output);
  if (path.dirname(target) === cache && path.basename(target).startsWith('.expedition-test-')) {
    rmSync(target, { recursive: true, force: true });
  }
}
