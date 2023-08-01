import {
  INVALID_BASE64_STRING,
  INVALID_DECODED_ID_TOKEN,
} from '../../constants/error';
import { Idtoken } from '../../types/index';

const VALID_PARTS_LENGTH = 3;

const base64DecodeUnicode = (str: string) => {
  return decodeURIComponent(
    atob(str).replace(/(.)/g, (_m, p) => {
      let code = p.charCodeAt(0).toString(16).toUpperCase();

      if (code.length < 2) {
        code = `0${code}`;
      }

      return `%${code}`;
    }),
  );
};

export const decode = <T extends Idtoken>(token: string): T => {
  const parts = token.split('.');
  const [header, payload, signature] = parts;

  if (
    parts.length !== VALID_PARTS_LENGTH ||
    !header ||
    !payload ||
    !signature
  ) {
    throw new Error(INVALID_DECODED_ID_TOKEN);
  }

  let output = payload.replace(/-/g, '+').replace(/_/g, '/');

  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error(INVALID_BASE64_STRING);
  }

  try {
    return JSON.parse(base64DecodeUnicode(output));
  } catch (error) {
    return JSON.parse(atob(output));
  }
};
