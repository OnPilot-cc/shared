/**
 * La marca de OnPilot, «Órbita con hueco», como datos: un núcleo de tinta, un
 * aro violeta que se abre donde está el punto, y el punto que abre su propio
 * camino. Tú en el centro; OnPilot dando la vuelta a tus herramientas.
 *
 * Geometría pura en un lienzo de 28. El aro es una circunferencia plana (nunca
 * una elipse inclinada) y el núcleo es sólido (nunca fuego): así no se parece a
 * ninguna hermana. La pintan `Mark` (React, `kit.tsx`), `markSvg` (texto, para
 * el kit de marca de `onpilot/scripts/render-brand.mjs`, que la copia y un test
 * lo comprueba) y nada más.
 */
export type MarkTone = "day" | "night";

export const MARK = {
	viewBox: "0 0 28 28",
	core: { cx: 14, cy: 14, r: 4.2 },
	ring: { d: "M13.67 4.51A9.5 9.5 0 1 1 6.51 8.15", width: 1.6 },
	dot: { cx: 9.69, cy: 5.54, r: 2.4 },
} as const;

/** `core` es el degradado vertical del núcleo, de arriba abajo. */
export const MARK_COLORS: Record<MarkTone, { core: readonly [string, string]; ring: string; dot: string }> = {
	day: { core: ["#2d2a66", "#12112a"], ring: "#5b3fd9", dot: "#5b3fd9" },
	night: { core: ["#4a45a0", "#2a2760"], ring: "#a99bff", dot: "#a99bff" },
};

/** La marca como SVG autónomo, con su degradado de id fijo `opm-core-<tone>`. */
export function markSvg(tone: MarkTone, size = 28): string {
	const c = MARK_COLORS[tone];
	const id = `opm-core-${tone}`;
	const { core, ring, dot } = MARK;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${MARK.viewBox}">` +
		`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.core[0]}"/><stop offset="1" stop-color="${c.core[1]}"/></linearGradient></defs>` +
		`<path d="${ring.d}" fill="none" stroke="${c.ring}" stroke-width="${ring.width}" stroke-linecap="round"/>` +
		`<circle cx="${core.cx}" cy="${core.cy}" r="${core.r}" fill="url(#${id})"/>` +
		`<circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}" fill="${c.dot}"/>` +
		`</svg>`
	);
}
