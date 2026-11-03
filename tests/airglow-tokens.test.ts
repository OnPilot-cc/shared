/** El mundo Airglow en `styles/sky.css`: su paleta, nada del mundo nocturno heredado y contraste AA en los pares que se leen. */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles/sky.css", import.meta.url), "utf8");
const token = (name: string) => css.match(new RegExp(`--sk-${name}:\\s*([^;]+);`))?.[1].trim();

function luminance(hex: string): number {
	const n = hex.replace("#", "");
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

describe("Airglow tokens", () => {
	it("carries the Airglow palette", () => {
		expect(token("ground")).toBe("#f5f5fa");
		expect(token("accent")).toBe("#5b3fd9");
		expect(token("night")).toBe("#07081a");
		expect(token("band")).toBe("#a99bff");
	});

	it("keeps nothing of the inherited night world", () => {
		for (const legacy of ["#070c18", "#f4a640", "244, 166, 64", "190, 210, 245", "#45d17f", "#050a14"]) expect(css).not.toContain(legacy);
	});

	it.each([
		["accent", "ground"],
		["accent", "surface"],
		["ink-3", "ground"],
		["ink-2", "surface"],
		["accent-deep", "accent-soft"],
		["night-ink-2", "night"],
		["night-ink", "night-2"],
	])("%s on %s reaches AA (4.5:1)", (fg, bg) => {
		const a = token(fg);
		const b = token(bg);
		expect(a, `--sk-${fg}`).toMatch(/^#[0-9a-f]{6}$/i);
		expect(b, `--sk-${bg}`).toMatch(/^#[0-9a-f]{6}$/i);
		expect(contrast(a!, b!)).toBeGreaterThanOrEqual(4.5);
	});

	it("the page is light", () => {
		expect(css).toMatch(/\.sk-page\s*\{[^}]*color-scheme:\s*light/);
	});

	it("Geist Mono lives behind one class", () => {
		expect(css).toMatch(/\.sk \.sk-mono\s*\{[^}]*font-family:\s*var\(--sk-mono\)/);
	});
});
