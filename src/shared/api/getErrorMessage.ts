import { HttpError, ResponseParseError } from './errors';

const ERROR_MESSAGES = {
  network:
    'No connection to the server. Check your internet connection and try again.',
  notFound: 'This content is no longer available.',
  server: 'The server is not responding right now. Try again in a moment.',
  request: 'The request could not be completed. Try again.',
  response: 'The server sent data the app cannot read. Try again later.',
  unknown: 'Something went wrong. Try again.',
} as const satisfies Record<string, string>;

const NOT_FOUND_STATUS = 404;
const SERVER_ERROR_MIN_STATUS = 500;

const getHttpErrorMessage = ({ status }: HttpError): string => {
  if (status === NOT_FOUND_STATUS) {
    return ERROR_MESSAGES.notFound;
  }
  if (status >= SERVER_ERROR_MIN_STATUS) {
    return ERROR_MESSAGES.server;
  }
  return ERROR_MESSAGES.request;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) {
    return getHttpErrorMessage(error);
  }
  if (error instanceof ResponseParseError) {
    return ERROR_MESSAGES.response;
  }
  if (error instanceof TypeError) {
    return ERROR_MESSAGES.network;
  }
  return ERROR_MESSAGES.unknown;
};
