import { randomBytes } from 'crypto';

function generateShortId(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < bytes.length; i++) {
    id += chars[bytes[i] % chars.length];
  }
  
  return id;
}

export { generateShortId };