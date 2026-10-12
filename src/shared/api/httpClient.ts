import { z } from 'zod';
import { API_BASE_URL } from '../config';
import { HttpError, ResponseParseError } from './errors';

type RequestOptions = {
  signal?: AbortSignal;
};

const JSON_HEADERS = { Accept: 'application/json' } as const;

const readJson = async (response: Response): Promise<unknown> => {
  try {
    const data: unknown = await response.json();
    return data;
  } catch {
    throw new ResponseParseError('the body is not valid JSON');
  }
};

const parseBody = <Schema extends z.ZodType>(
  schema: Schema,
  body: unknown,
): z.output<Schema> => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ResponseParseError(z.prettifyError(result.error));
  }
  return result.data;
};

const get = async <Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  { signal }: RequestOptions = {},
): Promise<z.output<Schema>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: JSON_HEADERS,
    signal,
  });
  if (!response.ok) {
    throw new HttpError(response.status);
  }
  return parseBody(schema, await readJson(response));
};

export const httpClient = { get } as const;
