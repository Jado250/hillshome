import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/** Replace the implementation with S3/R2 later; callers only use this interface. */
export interface StorageDriver {
  save(bytes: Uint8Array, safeName: string): Promise<string>; // returns storage key
  read(key: string): Promise<Buffer>;
}

class LocalDriver implements StorageDriver {
  // Vercel serverless functions have a read-only filesystem except /tmp.
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
}

export const storage: StorageDriver = new LocalDriver();
