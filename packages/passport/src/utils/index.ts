export * from './storage';

export const peelUndefinedInObj = (params: any) => {
  return Object.keys(params)
    .filter((key) => typeof params[key] !== 'undefined')
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
};
