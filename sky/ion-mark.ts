/**
 * El símbolo de Ion, «Limbo» (2026-11-05), como datos: la Tierra de noche vista
 * desde arriba y su borde encendido. Es la escena del cielo de las páginas en
 * pequeño; Ion es la luz que la rodea. La IA de OnPilot se llama Ion y éste es
 * su símbolo: nunca la Órbita de OnPilot (`mark.ts`), nunca destellos genéricos
 * de IA, nunca el aro de colores de Nova.
 *
 * Geometría pura en un lienzo de 28, como la marca de OnPilot. El arco es el
 * borde superior de un círculo concéntrico al disco, un poco mayor, y el halo es
 * el mismo arco más grueso y desenfocado. La pintan `IonMark` e `IonGlyph`
 * (`kit.tsx`), `ionMarkSvg` (texto, para el kit de marca de
 * `onpilot/scripts/render-brand.mjs`, que la copia y un test lo comprueba) y nada
 * más.
 */
export type IonTone = "day" | "night";

export const ION_MARK = {
	viewBox: "0 0 28 28",
	disc: { cx: 14, cy: 17, r: 8.6 },
	/** El borde encendido: un arco de 120° concéntrico al disco, separado de él para leerse a 16px. */
	arc: { d: "M4.04 11.25A11.5 11.5 0 0 1 23.96 11.25", r: 11.5, width: 2.2 },
	/** El desenfoque del halo, en unidades del lienzo. */
	blur: 0.9,
} as const;

/**
 * `disc` es el relleno del disco: tres paradas de un degradado radial (día) o un
 * solo color (noche). `halo` va debajo del arco, más grueso y transparente.
 */
export const ION_COLORS: Record<IonTone, { disc: readonly string[]; arc: string; halo: string; haloWidth: number; haloOpacity: number }> = {
	day: { disc: ["#2a2760", "#12112a", "#07081a"], arc: "#5b3fd9", halo: "#a99bff", haloWidth: 4.2, haloOpacity: 0.45 },
	night: { disc: ["#05050d"], arc: "#cfc6ff", halo: "#a99bff", haloWidth: 4.6, haloOpacity: 0.6 },
};

/** Las paradas del degradado del disco de día, de dentro afuera. */
export const ION_DISC_STOPS = [0, 0.6, 1] as const;

/** El símbolo como SVG autónomo, con ids fijos `ion-disc-<tone>` y `ion-soft-<tone>`. */
export function ionMarkSvg(tone: IonTone, size = 28): string {
	const c = ION_COLORS[tone];
	const { disc, arc, blur } = ION_MARK;
	const discId = `ion-disc-${tone}`;
	const softId = `ion-soft-${tone}`;
	const gradient =
		c.disc.length > 1
			? `<radialGradient id="${discId}" cx="50%" cy="20%" r="80%">${c.disc.map((color, i) => `<stop offset="${ION_DISC_STOPS[i]}" stop-color="${color}"/>`).join("")}</radialGradient>`
			: "";
	const fill = c.disc.length > 1 ? `url(#${discId})` : c.disc[0];
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${ION_MARK.viewBox}">` +
		`<defs>${gradient}<filter id="${softId}" filterUnits="userSpaceOnUse" x="0" y="0" width="28" height="28"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>` +
		`<circle cx="${disc.cx}" cy="${disc.cy}" r="${disc.r}" fill="${fill}"/>` +
		`<path d="${arc.d}" fill="none" stroke="${c.halo}" stroke-width="${c.haloWidth}" stroke-linecap="round" opacity="${c.haloOpacity}" filter="url(#${softId})"/>` +
		`<path d="${arc.d}" fill="none" stroke="${c.arc}" stroke-width="${arc.width}" stroke-linecap="round"/>` +
		`</svg>`
	);
}
