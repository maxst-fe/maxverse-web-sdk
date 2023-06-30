// eslint-disable-next-line @typescript-eslint/ban-types
export const sequenceHandler = <T extends Function, S>(handler: T | undefined, ...args: S[]) => {
  if (handler) {
    handler.apply(undefined, ...args);
  }
};
