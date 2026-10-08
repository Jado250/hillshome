import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

/**
 * Storage abstraction. Local driver for development, Vercel Blob in production.
 * Switches automatically when BLOB_READ_WRITE_TOKEN is set (Vercel adds it
 * when you connect a Blob store). No code or redeploy needed to switch.
 */
export interface StorageDriver {
  /** Stores bytes; returns an opaque storage key. */
  save(bytes: Uint8Array, safeName: string, mime?: string): Promise<string>;
  read(key: string): Promise<Buffer>;
  /** Best-effort delete; never throws. */
  remove(key: string): Promise<void>;
  /** Public URL for a stored key (direct URL for Blob, local route otherwise). */
  resolveUrl(key: string): string;
  readonly isRemote: boolean;
}

class LocalDriver implements StorageDriver {
  readonly isRemote = false;
  private root = path.resolve(process.env.UPLOAD_DIR
    ?? (process.env.VERCEL ? "/tmp/uploads" : "./uploads"));

  async save(bytes: Uint8Array, safeName: string) {
    const key = `${randomUUID()}-${safeName}`;
    await mkdir(this.root, { recursive: true });
    await writeFile(path.join(this.root, key), bytes);
    return key;
  }

  async read(key: string) {
    const target = path.resolve(this.root, key);
    if (!target.startsWith(this.root + path.sep)) throw new Error("Invalid key");
    return readFile(target);
  }

  async remove(key: string) {
    try {
      const target = path.resolve(this.root, key);
      if (!target.startsWith(this.root + path.sep)) return;
      await unlink(target);
    } catch { /* already gone */ }
  }

  resolveUrl(key: string) {
    return `/api/uploads/${encodeURIComponent(key)}`;
  }
}

class BlobDriver implements StorageDriver {
  readonly isRemote = true;

  async save(bytes: Uint8Array, safeName: string, mime?: string) {
    const key = `${randomUUID()}-${safeName}`;
    const blob = await put(key, Buffer.from(bytes), {
      access: "public",
      ...(mime ? { contentType: mime } : {}),
    });
    return blob.url;
  }

  async read(key: string) {
    const res = await fetch(key);
    if (!res.ok) throw new Error("File not found in Blob storage");
    return Buffer.from(await res.arrayBuffer());
  }

  async remove(key: string) {
    try { await del(key); } catch { /* already gone */ }
  }

  resolveUrl(key: string) {
    return key; // Blob keys are already public URLs
  }
}

function createDriver(): StorageDriver {
  return process.env.BLOB_READ_WRITE_TOKEN ? new BlobDriver() : new LocalDriver();
}

export function createStorageDriver(kind: "local" | "blob"): StorageDriver {
  return kind === "blob" ? new BlobDriver() : new LocalDriver();
}

export const storage: StorageDriver = createDriver();
