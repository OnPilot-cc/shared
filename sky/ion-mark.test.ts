/** El símbolo de Ion, «Limbo»: la Tierra de noche vista desde arriba con su borde encendido. Nunca la Órbita de OnPilot. */
import { describe, expect, it } from "vitest";
import { ION_MARK, ionMarkSvg } from "./ion-mark";

describe("ionMarkSvg", () => {
	it("draws the night disc and its lit rim", () => {
		const svg = ionMarkSvg("day");
		expect(svg).toContain('cx="14" cy="17" r="10"');
		expect(svg).toContain('d="M4.82 11.7A10.6 10.6 0 0 1 23.18 11.7"');
	});

	it("lights the rim in the band at night, never the day accent", () => {
		expect(ionMarkSvg("night")).toContain("#cfc6ff");
		expect(ionMarkSvg("night")).not.toContain("#5b3fd9");
		expect(ionMarkSvg("day")).toContain("#5b3fd9");
	});

	it("blurs the halo over the whole canvas, so the glow is never cut into a box", () => {
		for (const tone of ["day", "night"] as const) {
			expect(ionMarkSvg(tone)).toContain('filterUnits="userSpaceOnUse" x="0" y="0" width="28" height="28"');
		}
	});

	it("is not the OnPilot mark", () => {
		for (const tone of ["day", "night"] as const) {
			expect(ionMarkSvg(tone)).not.toContain("M13.67 4.51");
			expect(ionMarkSvg(tone)).not.toContain('r="4.2"');
		}
	});

	it("is a standalone svg at the size it is asked for", () => {
		const svg = ionMarkSvg("day", 64);
		expect(svg.startsWith("<svg")).toBe(true);
		expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
		expect(svg).toContain('width="64" height="64"');
		expect(svg).toContain(`viewBox="${ION_MARK.viewBox}"`);
	});
});
