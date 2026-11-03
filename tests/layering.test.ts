/**
 * `sky.css` no va en una capa de Tailwind, así que sus reglas ganan a cualquier
 * utilidad. Una regla de componente no puede fijar `position`, o se come el
 * `lg:sticky` de quien la monta (la mitad del cielo de la puerta de acceso).
 * Y el shader no se apoya en lo que GLSL deja sin definir.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles/sky.css", import.meta.url), "utf8");
const shader = readFileSync(new URL("../sky/sky-canvas.tsx", import.meta.url), "utf8");

describe("sky.css layering", () => {
	it("the band fallback does not set position, so a sticky aside stays sticky", () => {
		const block = css.match(/\.sk \.sk-band \{([^}]*)\}/)?.[1] ?? "";
		expect(block).not.toMatch(/position\s*:/);
	});
	it("a nav pill never wraps its label (es at 768px: «Iniciar sesión»)", () => {
		const block = css.match(/\.sk \.sk-navlink \{([^}]*)\}/)?.[1] ?? "";
		expect(block).toMatch(/white-space\s*:\s*nowrap/);
	});
});

describe("the Lectura shader", () => {
	it("never raises a possibly negative base with pow()", () => {
		expect(shader).not.toMatch(/\bpow\(/);
	});
	it("never calls smoothstep with its edges reversed", () => {
		for (const [, a, b] of shader.matchAll(/smoothstep\(([^,]+),\s*([^,]+),/g)) {
			expect(`${a} → ${b}`).not.toMatch(/^(Rp|apex|0\.08|size) → (Rp - |apex \* 0\.55|0\.0)/);
		}
		expect(shader).not.toMatch(/smoothstep\(0\.08, 0\.0,|smoothstep\(apex, apex \* 0\.55,|smoothstep\(Rp, Rp - /);
	});
});
