export type Success<T> = { success: true; data: T };

export type Failure<TType extends string, TDetails = unknown> = {
  success: false;
  error: { type: TType; details: TDetails };
};

export type Result<
  TSuccess,
  TType extends string = string,
  TDetails = unknown,
> = Success<TSuccess> | Failure<TType, TDetails>;

export const ok = <T>(data: T): Success<T> => ({ success: true, data });

export const fail = <TType extends string, TDetails>(
  type: TType,
  details: TDetails,
): Failure<TType, TDetails> => ({
  success: false,
  error: { type, details },
});
