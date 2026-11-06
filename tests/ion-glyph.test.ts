/** El glifo de Ion en `styles/sky.css`: un círculo blanco con filete, que late mientras Ion escribe y se queda quieto con movimiento reducido. */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles/sky.css", import.meta.url), "utf8");

describe("the Ion glyph", () => {
	it("is a white circle with a hairline", () => {
		expect(css).toMatch(/\.sk \.sk-ion-glyph\s*\{[^}]*border-radius:\s*50%/);
		expect(css).toMatch(/\.sk \.sk-ion-glyph\s*\{[^}]*var\(--sk-hair\)/);
	});

	it("pulses its rim for 1.6s only while Ion writes", () => {
		expect(css).toMatch(/\.sk \.sk-ion-glyph\[data-writing="true"\] \.sk-ion-arc\s*\{[^}]*animation:\s*sk-ion-pulse 1\.6s/);
		expect(css).toContain("@keyframes sk-ion-pulse");
	});

	it("stays still under reduced motion", () => {
		expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.sk-ion-arc\s*\{[^}]*animation:\s*none/);
	});
});
