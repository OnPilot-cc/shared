/** La lógica del cielo «Lectura»: horas a lo ancho de la banda, brillo por carga, el pulso de lectura y la subida de lo que importa. */
import { describe, expect, it } from "vitest";
import { DAY_SPAN, DEMO_DAY, PULSE_MS, bandIntensity, bandPoint, frozenRise, hourToX, pulseX, riseProgress } from "./airglow";

describe("airglow", () => {
	it("maps the day span across the band", () => {
		expect(DAY_SPAN).toEqual([7, 19]);
		expect(hourToX(7)).toBe(0);
		expect(hourToX(19)).toBe(1);
		expect(hourToX(13)).toBeCloseTo(0.5);
		expect(hourToX(9, [8, 10])).toBeCloseTo(0.5);
	});

	it("the band is brighter where there is more to do", () => {
		expect(bandIntensity(hourToX(10.8), DEMO_DAY)).toBeGreaterThan(bandIntensity(hourToX(13.5), DEMO_DAY));
		expect(bandIntensity(hourToX(11), DEMO_DAY)).toBeLessThanOrEqual(1.15);
	});

	it("an empty day is a calm floor, not darkness", () => {
		expect(bandIntensity(hourToX(18), [])).toBeCloseTo(0.18);
	});

	it("the reading pulse crosses the band once per period, never faster than ~8 s", () => {
		expect(PULSE_MS).toBeGreaterThanOrEqual(8000);
		expect(pulseX(0)).toBeCloseTo(-0.1);
		expect(pulseX(PULSE_MS - 1)).toBeCloseTo(1.2, 1);
		expect(pulseX(PULSE_MS)).toBeCloseTo(-0.1);
	});

	it("a light rises only after the pulse passes it", () => {
		expect(riseProgress(0.2, 0.3)).toBe(0);
		expect(riseProgress(0.38, 0.3)).toBeCloseTo(0.5);
		expect(riseProgress(0.3 + 0.16, 0.3)).toBe(1);
		expect(riseProgress(1.2, 0.3)).toBe(1);
	});

	it("with reduced motion everything that matters is already settled", () => {
		expect(frozenRise()).toBe(1);
	});

	it("the demo day is synthetic and in range", () => {
		expect(DEMO_DAY).toEqual([
			{ hour: 9, weight: 0.7 },
			{ hour: 10.8, weight: 1 },
			{ hour: 11.3, weight: 0.9 },
			{ hour: 15, weight: 0.8 },
		]);
	});
});

describe("bandPoint", () => {
	it("the band is highest in the middle and curves down to the sides", () => {
		const mid = bandPoint(0.5, 1000, 400);
		const left = bandPoint(0, 1000, 400);
		expect(mid.y).toBeCloseTo(338);
		expect(left.y).toBeGreaterThan(mid.y);
		expect(left.x).toBeCloseTo(70);
	});
});
