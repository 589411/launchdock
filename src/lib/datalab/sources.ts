import type { Table } from './types';
import { decodeBuffer, toTable } from './csv';
import { sample, sunlit, unlockCodeHashes } from '../../data/datalab';

async function fetchTable(url: string, name: string): Promise<Table> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}.csv 載入失敗（HTTP ${res.status}）`);
  return toTable(name, decodeBuffer(await res.arrayBuffer()));
}

async function loadFrom(baseUrl: string, files: readonly string[]): Promise<Record<string, Table>> {
  const tables = await Promise.all(files.map((f) => fetchTable(`${baseUrl}${f}.csv`, f)));
  return Object.fromEntries(tables.map((t) => [t.name, t]));
}

export const loadSample = () => loadFrom(sample.baseUrl, sample.files);
export const loadSunlit = () => loadFrom(sunlit.baseUrl, sunlit.files);

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isValidUnlockCode(code: string): Promise<boolean> {
  const h = await sha256Hex(code.trim());
  return unlockCodeHashes.includes(h);
}
