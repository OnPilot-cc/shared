// @vitest-environment jsdom
/** Las piezas de Airglow: la etiqueta herramienta · tipo · hora en Geist Mono, la frase del día y la costura de ejemplo. */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DayLine, ExampleSeam, ItemLabel } from "./airglow-kit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
	host = document.createElement("div");
	root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));

describe("ItemLabel", () => {
	it("reads tool · kind · time, one dot between fields, in Geist Mono", () => {
		act(() => root.render(<ItemLabel tool="Teams" kind="Message" time="11:00" />));
		const label = host.firstElementChild!;
		expect(label.textContent).toBe("Teams · Message · 11:00");
		expect(label.className).toContain("sk-mono");
		expect(label.className).toContain("sk-item-label");
		expect(label.querySelector("time")?.textContent).toBe("11:00");
	});
});

describe("ExampleSeam", () => {
	it("shows the label it is given, already translated", () => {
		act(() => root.render(<ExampleSeam label="Ejemplo" />));
		expect(host.textContent).toBe("Ejemplo");
		expect(host.firstElementChild!.className).toContain("sk-seam");
	});
});

describe("DayLine", () => {
	it("is the one-line summary of the day as a paragraph", () => {
		act(() =>
			root.render(
				<DayLine>
					For today you have <strong>2 projects due</strong>.
				</DayLine>,
			),
		);
		expect(host.firstElementChild!.tagName).toBe("P");
		expect(host.firstElementChild!.className).toContain("sk-dayline");
		expect(host.querySelector("strong")?.textContent).toBe("2 projects due");
	});
});
