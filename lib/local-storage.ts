import { catchError } from "./catch-error";

export function setItem(key: string, value: string) {
  const { error } = catchError(() => window.localStorage.setItem(key, value));

  if (error) {
    console.error(error);
  }
}

export function getItem(key: string) {
  const { error, result } = catchError(() => window.localStorage.getItem(key));

  if (error) {
    console.error(error);
    return;
  }

  if (result === undefined) {
    console.error("No result found with this key is in local storage!");
    return;
  }

  return result;
}
