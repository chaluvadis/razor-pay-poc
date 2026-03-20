import { HttpError } from "./httpError.js";

export const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "amount must be a positive integer in smallest currency unit (paise)");
  }
  return amount;
};

export const parseCurrency = (value) => {
  const currency = String(value || "INR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new HttpError(400, "currency must be a valid 3-letter ISO code");
  }
  return currency;
};

export const requireString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${fieldName} is required`);
  }
  return value.trim();
};
