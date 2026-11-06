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

	it("stays still under reduced motion: the pulse only exists when motion is allowed", () => {
		// Un `@media (reduce)` con un selector menos específico no anula la animación;
		// la única forma que no depende de la especificidad es no declararla nunca.
		const pulse = css.indexOf('.sk .sk-ion-glyph[data-writing="true"] .sk-ion-arc');
		const allowed = css.lastIndexOf("@media (prefers-reduced-motion: no-preference)", pulse);
		expect(pulse).toBeGreaterThan(-1);
		expect(allowed).toBeGreaterThan(-1);
		// El bloque `no-preference` sigue abierto cuando llega la regla del latido.
		expect(css.slice(allowed, pulse)).not.toMatch(/\r?\n\}/);
	});
});
