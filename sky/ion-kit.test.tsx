// @vitest-environment jsdom
/** Ion en la interfaz: el símbolo (día, noche, mono) y el glifo junto a sus respuestas, que late mientras escribe. */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IonGlyph, IonMark } from "./kit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
	host = document.createElement("div");
	root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));

describe("IonMark", () => {
	it("is decorative and draws the lit rim as the arc that pulses", () => {
		act(() => root.render(<IonMark />));
		const svg = host.querySelector("svg")!;
		expect(svg.getAttribute("aria-hidden")).toBe("true");
		expect(host.querySelector(".sk-ion-arc")).not.toBeNull();
		expect(host.innerHTML).toContain("#5b3fd9");
		expect(host.querySelector("filter")?.getAttribute("filterUnits")).toBe("userSpaceOnUse");
	});

	it("in mono it takes the colour of the text and no accent", () => {
		act(() => root.render(<IonMark tone="mono" />));
		expect(host.innerHTML).toContain("currentColor");
		expect(host.innerHTML).not.toContain("#5b3fd9");
	});
});

describe("IonGlyph", () => {
	it("says whether Ion is writing", () => {
		act(() => root.render(<IonGlyph writing />));
		expect(host.querySelector(".sk-ion-glyph")?.getAttribute("data-writing")).toBe("true");
		act(() => root.render(<IonGlyph />));
		expect(host.querySelector(".sk-ion-glyph")?.getAttribute("data-writing")).toBe("false");
	});
});
