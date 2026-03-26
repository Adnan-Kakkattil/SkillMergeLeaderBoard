export function asTrimmedString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export function requirePositiveInt(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const error = new Error(`${fieldName} must be a positive integer.`);
    error.statusCode = 400;
    throw error;
  }
  return num;
}

export function normalizeOptionalString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = asTrimmedString(value);
  return trimmed.length ? trimmed : null;
}

export function assertLength(value, fieldName, min, max) {
  if (value.length < min || value.length > max) {
    const error = new Error(`${fieldName} must be between ${min} and ${max} characters.`);
    error.statusCode = 400;
    throw error;
  }
}

export function sendValidationError(res, message) {
  return res.status(400).json({ error: message });
}
