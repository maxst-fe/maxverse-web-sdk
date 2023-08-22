/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCrypto = () => {
  return window.crypto;
};

export const createRandomString = () => {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';

  let random = '';

  const randomValues = Array.from(getCrypto().getRandomValues(new Uint8Array(43)));
  randomValues.forEach(v => (random += charset[v % charset.length]));

  return random;
};

export const sha256 = async (s: string) => {
  const digested: any = getCrypto().subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(s));

  return await digested;
};

export const bufferToBase64UrlEncoded = (input: number[] | Uint8Array) => {
  const ie11SafeInput = new Uint8Array(input);
  return urlEncodeB64(window.btoa(String.fromCharCode(...Array.from(ie11SafeInput))));
};

export const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = { '+': '-', '/': '_', '=': '' };
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};
