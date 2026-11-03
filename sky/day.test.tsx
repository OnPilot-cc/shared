// @vitest-environment jsdom
/** El documento de día: mientras se ve una página de Airglow, `<html>` y la barra del navegador llevan el suelo claro, y al salir vuelven a lo que había. */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { GROUND, useDayDocument } from "./day";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
	useDayDocument();
	return null;
}

describe("useDayDocument", () => {
	it("paints the light ground and restores the previous values on unmount", () => {
		const meta = document.createElement("meta");
		meta.name = "theme-color";
		meta.content = "#123456";
		document.head.append(meta);
		document.documentElement.style.backgroundColor = "rgb(1, 2, 3)";

		const host = document.createElement("div");
		const root = createRoot(host);
		act(() => root.render(<Probe />));
		expect(GROUND).toBe("#f5f5fa");
		expect(meta.content).toBe("#f5f5fa");
		expect(document.documentElement.style.backgroundColor).toBe("rgb(245, 245, 250)");

		act(() => root.unmount());
		expect(meta.content).toBe("#123456");
		expect(document.documentElement.style.backgroundColor).toBe("rgb(1, 2, 3)");
	});
});
