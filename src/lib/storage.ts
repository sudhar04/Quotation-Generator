import { del, get, set } from "idb-keyval";
import type { Quotation } from "@/models/quotation";

const KEY = "quotation-studio:quotations:v1";
const FLAG = "quotation-studio:seeded:v1";

export async function listQuotations(): Promise<Quotation[]> {
  const all = (await get<Quotation[]>(KEY)) ?? [];
  return [...all].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getQuotation(id: string): Promise<Quotation | undefined> {
  const all = await listQuotations();
  return all.find((q) => q.id === id);
}

export async function saveQuotation(q: Quotation): Promise<void> {
  const all = (await get<Quotation[]>(KEY)) ?? [];
  const index = all.findIndex((item) => item.id === q.id);
  const next = { ...q, updatedAt: Date.now() };
  if (index >= 0) all[index] = next;
  else all.unshift(next);
  await set(KEY, all);
}

export async function saveMany(list: Quotation[]): Promise<void> {
  const all = (await get<Quotation[]>(KEY)) ?? [];
  await set(KEY, [...list, ...all.filter((a) => !list.some((l) => l.id === a.id))]);
}

export async function deleteQuotation(id: string): Promise<void> {
  const all = (await get<Quotation[]>(KEY)) ?? [];
  await set(
    KEY,
    all.filter((q) => q.id !== id),
  );
}

export async function clearAll() {
  await del(KEY);
}

export async function hasSeeded() {
  return Boolean(await get<boolean>(FLAG));
}

export async function markSeeded() {
  await set(FLAG, true);
}
