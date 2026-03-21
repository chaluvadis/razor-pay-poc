import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "./httpError.ts";
import { parseAmount, parseCurrency, requireString } from "./validation.ts";

describe("validation utils", () => {
	it("parseAmount returns integer for valid positive numbers", () => {
		assert.equal(parseAmount(100), 100);
		assert.equal(parseAmount("250"), 250);
	});

	it("parseAmount throws for invalid values", () => {
		assert.throws(() => parseAmount(0), HttpError);
		assert.throws(() => parseAmount(-1), HttpError);
		assert.throws(() => parseAmount("abc"), HttpError);
	});

	it("parseCurrency normalizes and validates ISO code", () => {
		assert.equal(parseCurrency("inr"), "INR");
		assert.equal(parseCurrency(undefined), "INR");
		assert.throws(() => parseCurrency("rupee"), HttpError);
	});

	it("requireString trims valid values and rejects blank input", () => {
		assert.equal(requireString(" abc ", "name"), "abc");
		assert.throws(() => requireString("", "name"), HttpError);
		assert.throws(() => requireString(42, "name"), HttpError);
	});
});
