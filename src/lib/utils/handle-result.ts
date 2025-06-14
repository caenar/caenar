import { Result } from "./result";

export function handleResult<T, E extends string, M>(
  result: Result<T, E, M>,
  handlers: {
    ok?: (data: T) => void;
    error?: Partial<Record<E, (details: M) => void>>;
    fallback?: (error: { type: E; details?: M }) => void;
  },
) {
  if (result.success) {
    handlers.ok?.(result.data);
  } else {
    const fn = handlers.error?.[result.error.type];
    if (fn) {
      fn(result.error.details as M);
    } else {
      handlers.fallback?.(result.error);
    }
  }
}
