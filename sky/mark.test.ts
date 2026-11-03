/** La marca Órbita con hueco: el aro se abre donde está el punto, y nada de la órbita inclinada heredada. */
import { describe, expect, it } from "vitest";
import { MARK, markSvg } from "./mark";

describe("markSvg", () => {
	it("opens the ring where the dot is", () => {
		const svg = markSvg("day");
		expect(svg).toContain('d="M13.67 4.51A9.5 9.5 0 1 1 6.51 8.15"');
		expect(svg).toContain('cx="9.69" cy="5.54" r="2.4"');
		expect(svg).toContain('r="4.2"');
		expect(svg).not.toMatch(/ellipse|rotate\(/);
	});

	it("draws ring and dot in the band at night, never the day accent", () => {
		expect(markSvg("night")).toContain("#a99bff");
		expect(markSvg("night")).not.toContain("#5b3fd9");
		expect(markSvg("day")).toContain("#5b3fd9");
	});

	it("is a standalone svg at the size it is asked for", () => {
		const svg = markSvg("day", 64);
		expect(svg.startsWith("<svg")).toBe(true);
		expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
		expect(svg).toContain('width="64" height="64"');
		expect(svg).toContain(`viewBox="${MARK.viewBox}"`);
	});
});
