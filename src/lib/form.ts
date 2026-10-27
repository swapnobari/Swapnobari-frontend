import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { SubmitError } from "./client";

// Puts server errors on the right fields; returns a general message for the rest
export function handleSubmitError<T extends FieldValues>(
  e: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly string[]
): string {
  if (!(e instanceof SubmitError)) return "Something went wrong. Please try again.";
  const general: string[] = [];
  if (e.detail) general.push(e.detail);
  for (const [k, msgs] of Object.entries(e.fields)) {
    if (fieldNames.includes(k)) setError(k as Path<T>, { message: msgs[0] });
    else general.push(`${k}: ${msgs[0]}`);
  }
  return general.join(" ");
}