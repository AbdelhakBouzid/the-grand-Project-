import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

@Injectable()
export class StorageService {
  async uploadBuffer(key: string, body: Buffer) {
    const base = process.env.LOCAL_STORAGE_PATH || '/tmp/eduworld-uploads';
    const filePath = join(base, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
    return { key, checksumSha256: createHash('sha256').update(body).digest('hex') };
  }
}
