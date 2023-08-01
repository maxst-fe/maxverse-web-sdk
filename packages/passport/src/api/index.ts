export interface Options {
  baseUrl: string;
  headers: HeadersInit;
}

export class HttpClient {
  #baseUrl: string;
  #headers: HeadersInit;

  constructor(options: Options) {
    this.#baseUrl = options.baseUrl;
    this.#headers = options.headers;
  }

  async #fetchJSON(endpoint: string, options: RequestInit = {}) {
    try {
      const res = await fetch(`${this.#baseUrl}/${endpoint}`, {
        ...options,
        headers: this.#headers,
      });

      return res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error);
    }
  }

  post(endpoint = '', options: Omit<RequestInit, 'headers' | 'method'>) {
    return this.#fetchJSON(endpoint, {
      ...options,
      body: options.body,
      method: 'POST',
    });
  }
}
