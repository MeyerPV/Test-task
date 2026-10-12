export class HttpError extends Error {
  override readonly name = 'HttpError';
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
  }
}

export class ResponseParseError extends Error {
  override readonly name = 'ResponseParseError';

  constructor(reason: string) {
    super(`Unexpected response: ${reason}`);
  }
}
