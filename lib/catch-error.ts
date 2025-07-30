type catchErrorAsyncResponse<T> = Promise<{
  error: string | null;
  result: T | null;
}>;

type AsyncFunction<T> = () => Promise<T>;

export async function catchErrorAsync<T>(
  asyncFn: AsyncFunction<T>,
): catchErrorAsyncResponse<T> {
  try {
    const result = await asyncFn();
    return { error: null, result: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, result: null };
    }

    return { error: "Unknown error", result: null };
  }
}

type catchErrorResponse<T> = {
  error: string | null;
  result: T | null;
};

export function catchError<T>(fn: () => T): catchErrorResponse<T> {
  try {
    const result = fn();
    return { error: null, result: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, result: null };
    }

    return { error: "Unknown error", result: null };
  }
}
