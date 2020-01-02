import { spawn } from 'child_process';
import { env } from 'process';

const ENV_KEYS: Record<string, string> = Object.fromEntries(
  Object.keys(env).map((v) => [v.toLowerCase(), v]),
);

export const getEnvVar = (name: string): string | null => {
  const varName = ENV_KEYS[name.toLowerCase()];
  return varName ? env[varName] || '' : null;
};

export interface CmdResult {
  code: number;
  stdout: string;
  stderr: string;
  signal: string;
}

export const invokeCmd = (cmd: string, ...args: string[]): Promise<CmdResult> => new Promise((resolve) => {
  const result: CmdResult = {
    code: 0, stdout: '', stderr: '', signal: '',
  };
  const cp = spawn(cmd, args);
  cp.stdout.on('data', (chunk) => {
    result.stdout += chunk.toString();
  });
  cp.stderr.on('data', (chunk) => {
    result.stderr += chunk.toString();
  });
  cp.on('close', (code, signal) => {
    result.code = code;
    result.signal = signal;
    if (result.stdout) { console.debug(result.stdout); }
    if (result.stderr) { console.error(result.stderr); }
    console.debug(result);
    resolve(result);
  });
});
