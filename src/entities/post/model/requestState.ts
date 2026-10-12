import type { RequestState } from './types';

export const IDLE_REQUEST: RequestState = { status: 'idle' };

export const LOADING_REQUEST: RequestState = { status: 'loading' };

export const SUCCEEDED_REQUEST: RequestState = { status: 'succeeded' };

export const isRequestInFlight = (request: RequestState | undefined): boolean =>
  request?.status === 'loading';
