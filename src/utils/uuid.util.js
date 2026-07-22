import { randomUUID } from "node:crypto";

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const generate = () => randomUUID();
export const isValid = (value) =>
  typeof value === "string" && uuidV4Pattern.test(value);
