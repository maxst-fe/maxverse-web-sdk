/* eslint-disable @typescript-eslint/no-explicit-any */
import { PassportClientOptions } from '@maxverse/passport-web-sdk';

/**
 * @deprecated
 */
export const checkClientOptionsDiff = (
  prevoptions: (PassportClientOptions & { [key: string]: any }) | null,
  newOptions: PassportClientOptions
) => {
  if (!prevoptions) {
    return true;
  }

  const shallowDiff = Object.entries(newOptions).some(([key, val]) => {
    if (!prevoptions[key]) {
      return true;
    }

    return prevoptions[key] !== val;
  });

  return shallowDiff;
};
