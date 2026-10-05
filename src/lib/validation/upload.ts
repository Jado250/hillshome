export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED = {
  "image/jpeg": { ext: [".jpg", ".jpeg"], magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: [".png"], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "application/pdf": { ext: [".pdf"], magic: [[0x25, 0x50, 0x44, 0x46]] },
} as const;

export type FileCheck =
  | { ok: true; mime: string; safeName: string }
  | { ok: false; error: string };

export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "file";
}

/** Checks size, extension, declared MIME type and magic bytes. */
export function checkFile(name: string, declaredMime: string, bytes: Uint8Array): FileCheck {
  if (bytes.length === 0) return { ok: false, error: `${name} is empty.` };
  if (bytes.length > MAX_FILE_BYTES) return { ok: false, error: `${name} is larger than 5 MB.` };
  const rule = ALLOWED[declaredMime as keyof typeof ALLOWED];
  if (!rule) return { ok: false, error: `${name}: only JPG, PNG or PDF files are allowed.` };
  const lower = name.toLowerCase();
  if (!(rule.ext as readonly string[]).some((e) => lower.endsWith(e))) {
    return { ok: false, error: `${name}: file extension does not match its type.` };
  }
  const matches = (rule.magic as readonly (readonly number[])[]).some((sig) =>
    sig.every((b, i) => bytes[i] === b));
  if (!matches) return { ok: false, error: `${name}: file content does not match its type.` };
  return { ok: true, mime: declaredMime, safeName: sanitizeFileName(name) };
}
