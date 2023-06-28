/* eslint-disable @typescript-eslint/no-explicit-any */
interface Registerations {
  dependencies: string[];
  func: (...args: any[]) => any;
}

class DI {
  #registrations: Record<string, Registerations>;

  constructor() {
    this.#registrations = {};
  }

  get errorMessage() {
    return "registerRequiredArgs: [string, Array<string>, func]";
  }

  #checkValidArgs = (
    name: string,
    dependencies: string[],
    func: (...args: any[]) => any
  ) => {
    return (
      typeof name === "string" ||
      Array.isArray(dependencies) ||
      typeof func === "function"
    );
  };

  register = (
    name: string,
    dependencies: string[],
    func: (...args: any[]) => any
  ) => {
    if (!this.#checkValidArgs(name, dependencies, func)) {
      throw new Error(this.errorMessage);
    }
    this.#registrations[name] = { dependencies, func };
  };

  get = (name: string) => {
    const registeration = this.#registrations[name];
    const dependencies: string[] = [];

    if (!registeration) {
      return undefined;
    }

    registeration.dependencies.forEach((dependencyName: string) => {
      const dependency = this.get(dependencyName);
      dependencies.push(dependency);
    });

    return registeration.func.apply(undefined, dependencies);
  };
}

export default DI;
