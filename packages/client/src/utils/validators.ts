import { isNaN } from "lodash";

export function validateNameString(string: string): boolean {
  const regex = /^[a-zA-ZÀ-ÿ\d\s]+$/;
  return regex.test(string);
}

export function safeNumber(value: string) {
  const number = Number(value);
  if (isNaN(number)) {
    throw Error(`Value could not be parsed to number: ${value}`);
  }
  return number;
}
