import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwdhashService {
  async hashPassword(password: string): Promise<string> {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}