import urlJoin from 'url-join';
import type { HTTPClient, RequestOptions } from './HTTPClient';

interface DAVClientConstructorOptions {
  baseURL: string;
  httpClient: HTTPClient;
  headers?: HeadersInit;
}

export class DAVClient {
  private baseURL: string;
  private httpClient: HTTPClient;
  private headers?: HeadersInit;

  constructor({ baseURL, httpClient, headers }: DAVClientConstructorOptions) {
    this.baseURL = baseURL;
    this.httpClient = httpClient;

    if (headers) {
      this.headers = headers;
    }
  }

  private buildRequestOptions(options: RequestOptions): RequestOptions {
    return {
      ...options,
      url: this.buildFullURL(options.url),
      headers: { ...this.headers, ...options.headers } 
    };
  }

  private buildFullURL(url: string) {
    return urlJoin(this.baseURL, url);
  }

  public attachHeaders(headers: HeadersInit): void {
    this.headers = { ...this.headers, ...headers };
  }

  public changeBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  public requestJson<T>(options: RequestOptions): Promise<T> {
    return this.httpClient.requestJson<T>(this.buildRequestOptions(options));
  }

  public requestText(options: RequestOptions): Promise<string> {
    return this.httpClient.requestText(this.buildRequestOptions(options));
  }
}
