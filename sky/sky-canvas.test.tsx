// @vitest-environment jsdom
/** El cielo «Lectura»: sin WebGL2 avisa y deja el respaldo de CSS, el lienzo es decorativo y las horas van en Geist Mono. */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SkyCanvas } from "./sky-canvas";
import { SkyHours } from "./sky-hours";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

describe("SkyCanvas", () => {
	it("without WebGL2 it reports and leaves the CSS fallback in place", () => {
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		const onUnsupported = vi.fn();
		act(() =>
			root.render(
				<div className="sk-band">
					<SkyCanvas onUnsupported={onUnsupported} />
				</div>,
			),
		);
		expect(onUnsupported).toHaveBeenCalled();
		expect(host.querySelector(".sk-band")).not.toBeNull();
	});

	it("is decorative", () => {
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
		act(() => root.render(<SkyCanvas />));
		expect(host.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
	});
});

describe("SkyHours", () => {
	it("prints the hours of the band in Geist Mono, every two hours by default", () => {
		act(() => root.render(<SkyHours />));
		const labels = [...host.querySelectorAll("span")].map((s) => s.textContent);
		expect(labels).toEqual(["08", "10", "12", "14", "16", "18"]);
		expect(host.querySelector("span")?.className).toContain("sk-mono");
		expect(host.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
	});
});

describe("SkyCanvas still", () => {
	class Quiet {
		observe() {}
		disconnect() {}
	}
	/** Un contexto WebGL2 que acepta todo: cada propiedad es una función que devuelve algo verdadero. */
	const fakeGl = new Proxy({}, { get: () => () => ({}) });

	beforeEach(() => {
		globalThis.ResizeObserver = Quiet as unknown as typeof ResizeObserver;
		globalThis.IntersectionObserver = Quiet as unknown as typeof IntersectionObserver;
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeGl as unknown as RenderingContext);
	});

	it("without still the reading loop starts", () => {
		const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
		act(() => root.render(<SkyCanvas />));
		expect(raf).toHaveBeenCalled();
	});

	it("with still it paints one frame and never starts the loop", () => {
		const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
		act(() => root.render(<SkyCanvas still />));
		expect(raf).not.toHaveBeenCalled();
		expect(host.querySelector("canvas")?.getAttribute("data-ready")).toBe("true");
	});
});
