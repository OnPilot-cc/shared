/**
 * El documento entero lleva el suelo claro de Airglow mientras se ve una página
 * del mundo: el fondo de `<html>` (lo que asoma en el rebote del scroll) y el
 * color de la barra del navegador. Lo devuelve como estaba al salir. Lo llaman
 * el marco del sitio y de la puerta de onpilot y el marco de consola.
 */
import { useEffect } from "react";

export const GROUND = "#f5f5fa";

export function useDayDocument(): void {
	useEffect(() => {
		const root = document.documentElement;
		const previous = root.style.backgroundColor;
		const meta = document.querySelector('meta[name="theme-color"]');
		const previousTheme = meta?.getAttribute("content") ?? null;
		root.style.backgroundColor = GROUND;
		meta?.setAttribute("content", GROUND);
		return () => {
			root.style.backgroundColor = previous;
			if (meta && previousTheme) meta.setAttribute("content", previousTheme);
		};
	}, []);
}
