/**
 * La lógica del cielo «Lectura», sin DOM: dónde cae cada hora en la banda, cuánto
 * brilla la banda según lo que la persona tiene a esa hora, por dónde va el pulso
 * de lectura y cuánto ha subido una luz que importa. La comparten el lienzo
 * (`sky-canvas.tsx`) y las horas en DOM (`sky-hours.tsx`), así los dos pintan la
 * misma curva.
 *
 * La carga (`DayLoad[]`) no sabe de dónde viene: en el sitio es `DEMO_DAY`
 * (sintético, y quien lo muestra pone la costura «Example»); en la app la
 * pondrá la vista del día real.
 */

/** Lo que la persona tiene a una hora: hora decimal (0–24) y peso (0–1). */
export type DayLoad = { hour: number; weight: number };

/** Las horas que cubre la banda, de izquierda a derecha. */
export const DAY_SPAN: [number, number] = [7, 19];

/** Un pulso de lectura cada 9 s: nunca más a menudo que uno cada ~8 s. */
export const PULSE_MS = 9000;

/** Un día de ejemplo, sintético: algo a las 9, mucho entre las 11 y las 11:30, una reunión a las 15. */
export const DEMO_DAY: DayLoad[] = [
	{ hour: 9, weight: 0.7 },
	{ hour: 11, weight: 1 },
	{ hour: 11.5, weight: 0.9 },
	{ hour: 15, weight: 0.8 },
];

const FLOOR = 0.18;
const CEILING = 1.15;
const SPREAD = 0.045;
const RISE_RUN = 0.16;

/** Una hora como fracción (0–1) del ancho de la banda. */
export function hourToX(hour: number, span: [number, number] = DAY_SPAN): number {
	return (hour - span[0]) / (span[1] - span[0]);
}

/** El brillo de la banda en `x` (0–1): un suelo tranquilo más una campana por cada carga. */
export function bandIntensity(x: number, load: DayLoad[], span: [number, number] = DAY_SPAN): number {
	let v = FLOOR;
	for (const item of load) {
		const d = (x - hourToX(item.hour, span)) / SPREAD;
		v += item.weight * 0.8 * Math.exp(-d * d);
	}
	return Math.min(v, CEILING);
}

/** Dónde va el pulso de lectura (de −0.1 a 1.2 del ancho) en el instante `tMs`. */
export function pulseX(tMs: number, periodMs: number = PULSE_MS): number {
	const phase = (((tMs % periodMs) + periodMs) % periodMs) / periodMs;
	return -0.1 + phase * 1.3;
}

/** Cuánto ha subido (0–1) la luz de `itemX` cuando el pulso va por `pulse`. */
export function riseProgress(pulse: number, itemX: number): number {
	const run = pulse - itemX;
	if (run <= 0) return 0;
	if (run >= RISE_RUN - 1e-9) return 1;
	return run / RISE_RUN;
}

/**
 * Qué elementos (por su posición `xs`, 0–1) cruzó el pulso entre el fotograma
 * anterior y éste. Un barrido que vuelve a empezar no cruza nada hacia atrás.
 */
export function passedItems(prev: number, pulse: number, xs: number[]): number[] {
	if (pulse <= prev) return [];
	const out: number[] = [];
	xs.forEach((x, i) => {
		if (prev < x && x <= pulse) out.push(i);
	});
	return out;
}

/** El fotograma quieto: todo lo que importa ya está fijado en su hora. */
export function frozenRise(): number {
	return 1;
}

/**
 * La curva de la banda en un lienzo de `w × h` px: un arco de circunferencia
 * cuyo punto más alto cae al 84,5 % de la altura, de radio 1,352 veces el ancho
 * (la Tierra vista desde arriba). Las horas ocupan el 86 % central del ancho.
 */
export const BAND = { apex: 0.845, radius: 1.352, inset: 0.07, planetGap: 0.022 } as const;

/** El punto (px) de la banda donde cae `hx` (0–1 del tramo de horas). */
export function bandPoint(hx: number, w: number, h: number): { x: number; y: number } {
	const x = (BAND.inset + (1 - 2 * BAND.inset) * hx) * w;
	const r = BAND.radius * w;
	const cy = BAND.apex * h + r;
	const dx = x - w / 2;
	return { x, y: cy - Math.sqrt(r * r - dx * dx) };
}
