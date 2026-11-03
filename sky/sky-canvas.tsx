import { useEffect, useRef, useState } from "react";
import { BAND, DAY_SPAN, DEMO_DAY, PULSE_MS, bandPoint, hourToX, passedItems, pulseX, riseProgress, type DayLoad } from "./airglow";

/**
 * El cielo de OnPilot, «Lectura»: un solo shader WebGL2, sin dependencias.
 *
 * La Tierra de noche vista desde arriba, abajo, con un filete fino en el limbo;
 * encima, la banda de la ionosfera, que brilla más en las horas en que la
 * persona tiene más cosas (`load`). Cada pocos segundos un pulso de lectura la
 * recorre de izquierda a derecha (OnPilot leyendo) y, al pasar, las luces de
 * las herramientas que importan suben desde la Tierra y se quedan fijas en su
 * hora con un anillo fino. Entre pulsos, ondas suaves recorren la banda. Las
 * horas no las pinta el shader: van en DOM, en Geist Mono (`sky-hours.tsx`),
 * sobre la misma curva (`bandPoint` de `airglow.ts`).
 *
 * Coste acotado: el bucle sólo corre con el lienzo en pantalla y la pestaña
 * visible; la resolución se limita a 1,5× y baja en pantallas estrechas. Con
 * movimiento reducido, o con `still`, se pinta un solo fotograma con todo lo
 * que importa ya fijado y sin pulso. Si no hay WebGL2 (o se pierde el
 * contexto) avisa con `onUnsupported` y el respaldo de CSS de debajo
 * (`.sk-band`) se queda como está. `onPass(i)` avisa cuando el pulso cruza la
 * hora del elemento `i` de `load` (la portada enciende esa fila); con el
 * fotograma quieto no avisa nunca.
 *
 * El lienzo es decorativo (`aria-hidden`): lo que dice está dicho en el texto.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const MAX_LOAD = 8;
const MAX_LIGHTS = 16;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uPulse;
uniform float uScale;
uniform vec4 uBand;
uniform vec2 uLoad[${MAX_LOAD}];
uniform int uLoadN;
uniform vec4 uLight[${MAX_LIGHTS}];
uniform vec2 uLightTone[${MAX_LIGHTS}];

out vec4 outColor;

const vec3 NIGHT = vec3(0.027, 0.031, 0.102);
const vec3 NIGHT2 = vec3(0.078, 0.078, 0.196);
const vec3 BANDC = vec3(0.663, 0.608, 1.0);
const vec3 GLOW = vec3(0.812, 0.776, 1.0);
const vec3 LIMB = vec3(0.427, 0.388, 0.788);
const vec3 TOOL = vec3(1.0, 0.906, 0.761);
const vec3 HELD = vec3(0.937, 0.933, 0.984);

float hash(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}
float stars(vec2 p, float cells) {
	vec2 g = p / uRes.x * cells;
	vec2 id = floor(g);
	vec2 f = fract(g) - 0.5;
	float h = hash(id);
	if (h < 0.93) return 0.0;
	vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
	float d = length(f - o * 0.6);
	float tw = 0.6 + 0.4 * sin(uTime * (0.4 + h * 1.6) + h * 40.0);
	return smoothstep(0.08, 0.0, d) * tw * (h - 0.93) / 0.07;
}

void main() {
	// y hacia abajo, como el DOM, para compartir la curva con las horas.
	vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
	float w = uRes.x;
	float apex = uBand.x * uRes.y;
	float R = uBand.y * w;
	vec2 c = vec2(w * 0.5, apex + R);
	float Rp = R - uBand.w * w;
	float d = length(p - c);
	float s = uScale;

	vec3 col = mix(NIGHT, NIGHT2, smoothstep(0.0, apex, p.y));
	col += vec3(stars(p, 90.0)) * 0.55 * smoothstep(apex, apex * 0.55, p.y);

	// el brillo de la banda en esta columna: suelo tranquilo + campanas de carga
	float hx = (p.x / w - uBand.z) / (1.0 - 2.0 * uBand.z);
	float k = 0.18;
	for (int i = 0; i < ${MAX_LOAD}; i++) {
		if (i >= uLoadN) break;
		float e = (hx - uLoad[i].x) / 0.045;
		k += uLoad[i].y * 0.8 * exp(-e * e);
	}
	k = min(k, 1.15);
	k = k * (0.86 + 0.14 * sin(uTime * 0.5)) + 0.07 * sin(hx * 40.0 - uTime * 0.7);
	if (uPulse > -0.5) {
		float e = (hx - uPulse) / 0.046;
		k = k * 0.75 + exp(-e * e) * 0.95;
	}
	k = max(k, 0.05);

	// la banda: un trazo fino con su resplandor, por encima del limbo
	float db = d - R;
	float core = exp(-pow(db / (1.8 * s), 2.0));
	float halo = exp(-pow(db / (15.0 * s), 2.0));
	col += BANDC * halo * 0.42 * k + mix(BANDC, GLOW, 0.6) * core * 0.85 * k;

	// la Tierra de noche y su limbo
	if (d < Rp) {
		float t = clamp((p.y - apex) / (uRes.y - apex + 1.0), 0.0, 1.0);
		vec3 planet = mix(vec3(0.114, 0.102, 0.282), vec3(0.02, 0.02, 0.051), smoothstep(0.0, 0.9, t + abs(p.x - w * 0.5) / w));
		col = mix(col, planet, smoothstep(Rp, Rp - 1.5 * s, d));
	}
	col += LIMB * exp(-pow((d - Rp) / (0.9 * s), 2.0)) * 0.55;

	// las luces de las herramientas: ámbar tenue abajo; fijadas en su hora, claras y con anillo
	for (int i = 0; i < ${MAX_LIGHTS}; i++) {
		vec4 L = uLight[i];
		if (L.w <= 0.0) continue;
		float dl = length(p - L.xy);
		vec3 tone = mix(TOOL, HELD, uLightTone[i].x);
		col += tone * exp(-pow(dl / L.z, 2.0)) * L.w;
		col += HELD * exp(-pow((dl - 9.0 * s) / (0.8 * s), 2.0)) * 0.35 * uLightTone[i].y;
	}

	outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn("[sky] shader:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Luces de fondo que no suben: el resto de herramientas, quietas en la Tierra. */
const IDLE = [0.18, 0.31, 0.43, 0.58, 0.71, 0.84];

export function SkyCanvas({
	load = DEMO_DAY,
	span = DAY_SPAN,
	still = false,
	onUnsupported,
	onPass,
	className = "",
}: {
	/** Lo que la persona tiene en el día; por defecto, el día de ejemplo (sintético). */
	load?: DayLoad[];
	/** Las horas que cubre la banda. */
	span?: [number, number];
	/** Un solo fotograma quieto, con lo importante fijado (la puerta de acceso). */
	still?: boolean;
	onUnsupported?: () => void;
	/** El pulso cruzó la hora del elemento `i` de `load`. */
	onPass?: (i: number) => void;
	className?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ready, setReady] = useState(false);
	const unsupported = useRef(onUnsupported);
	const passed = useRef(onPass);
	useEffect(() => {
		unsupported.current = onUnsupported;
		passed.current = onPass;
	}, [onUnsupported, onPass]);
	const loadKey = JSON.stringify(load.slice(0, MAX_LOAD));
	const [spanFrom, spanTo] = span;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const items: DayLoad[] = JSON.parse(loadKey);
		const range: [number, number] = [spanFrom, spanTo];
		const gl = canvas.getContext("webgl2", {
			antialias: false,
			alpha: false,
			depth: false,
			stencil: false,
			premultipliedAlpha: false,
			powerPreference: "low-power",
		});
		if (!gl) {
			unsupported.current?.();
			return;
		}

		const vs = compile(gl, gl.VERTEX_SHADER, VERT);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
		const program = gl.createProgram();
		if (!vs || !fs || !program) {
			unsupported.current?.();
			return;
		}
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn("[sky] link:", gl.getProgramInfoLog(program));
			unsupported.current?.();
			return;
		}
		gl.useProgram(program);

		// Un triángulo que cubre la pantalla entera.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const aPos = gl.getAttribLocation(program, "aPos");
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		const u = {
			res: gl.getUniformLocation(program, "uRes"),
			time: gl.getUniformLocation(program, "uTime"),
			pulse: gl.getUniformLocation(program, "uPulse"),
			scale: gl.getUniformLocation(program, "uScale"),
			band: gl.getUniformLocation(program, "uBand"),
			load: gl.getUniformLocation(program, "uLoad"),
			loadN: gl.getUniformLocation(program, "uLoadN"),
			light: gl.getUniformLocation(program, "uLight"),
			lightTone: gl.getUniformLocation(program, "uLightTone"),
		};
		gl.uniform4f(u.band, BAND.apex, BAND.radius, BAND.inset, BAND.planetGap);
		const loadData = new Float32Array(MAX_LOAD * 2);
		items.forEach((it, i) => {
			loadData[i * 2] = hourToX(it.hour, range);
			loadData[i * 2 + 1] = Math.max(0, Math.min(1, it.weight));
		});
		gl.uniform2fv(u.load, loadData);
		gl.uniform1i(u.loadN, items.length);

		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const frozen = reduce || still;

		let w = 1;
		let h = 1;
		let unit = 1;
		const lights = new Float32Array(MAX_LIGHTS * 4);
		const tones = new Float32Array(MAX_LIGHTS * 2);

		const measure = () => {
			const rect = canvas.getBoundingClientRect();
			const narrow = rect.width < 768;
			const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (narrow ? 0.75 : 1);
			w = Math.max(1, Math.round(rect.width * scale));
			h = Math.max(1, Math.round(rect.height * scale));
			unit = w / 1000;
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			gl.viewport(0, 0, w, h);
			gl.uniform2f(u.res, w, h);
			gl.uniform1f(u.scale, unit);
		};

		/** Dónde está una luz de la Tierra: bajo el limbo, cerca de `hx`. */
		const ground = (hx: number, row: number) => {
			const top = bandPoint(hx, w, h);
			return { x: top.x, y: top.y + (BAND.planetGap * w) + (22 + row * 13) * unit };
		};

		let time = 0;
		let first = true;
		let lastPulse = -1;
		const itemXs = items.map((it) => hourToX(it.hour, range));
		const draw = () => {
			lights.fill(0);
			tones.fill(0);
			const pulse = frozen ? -1 : pulseX(time * 1000, PULSE_MS);
			if (!frozen && passed.current) for (const i of passedItems(lastPulse, pulse, itemXs)) passed.current(i);
			lastPulse = pulse;
			let slot = 0;
			// lo que importa: sube desde la Tierra hasta su hora cuando el pulso pasa
			items.forEach((it, i) => {
				if (slot >= MAX_LIGHTS) return;
				const hx = hourToX(it.hour, range);
				const from = ground(Math.min(1, Math.max(0, hx + (i % 2 ? 0.05 : -0.05))), i % 3);
				const to = bandPoint(hx, w, h);
				const r = frozen ? 1 : riseProgress(pulse, hx);
				const e = easeInOut(r);
				const held = r >= 1 ? 1 : 0;
				lights[slot * 4] = from.x + (to.x - from.x) * e;
				lights[slot * 4 + 1] = from.y + (to.y - from.y) * e;
				lights[slot * 4 + 2] = (held ? 3.4 : 2) * unit;
				lights[slot * 4 + 3] = r > 0 ? 0.65 + 0.35 * e : 0.45 + 0.2 * Math.sin(time * 1.3 + i * 1.7);
				tones[slot * 2] = e;
				tones[slot * 2 + 1] = held;
				slot++;
			});
			// el resto: quietas, titilando apenas
			IDLE.forEach((hx, i) => {
				if (slot >= MAX_LIGHTS) return;
				const at = ground(hx, (i + 1) % 3);
				lights[slot * 4] = at.x;
				lights[slot * 4 + 1] = at.y;
				lights[slot * 4 + 2] = 1.7 * unit;
				lights[slot * 4 + 3] = 0.3 + 0.18 * Math.sin(time * 1.1 + i * 2.3);
				slot++;
			});
			gl.uniform4fv(u.light, lights);
			gl.uniform2fv(u.lightTone, tones);
			gl.uniform1f(u.pulse, pulse);
			gl.uniform1f(u.time, time);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			if (first) {
				first = false;
				setReady(true);
			}
		};

		let last = 0;
		let raf = 0;
		let onScreen = true;
		const frame = (now: number) => {
			const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
			last = now;
			time += dt;
			draw();
			raf = requestAnimationFrame(frame);
		};
		const start = () => {
			if (frozen || raf || !onScreen || document.hidden) return;
			last = 0;
			raf = requestAnimationFrame(frame);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};

		const resize = new ResizeObserver(() => {
			measure();
			if (frozen || !raf) draw();
		});
		resize.observe(canvas);

		const io = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			if (onScreen) start();
			else stop();
		});
		io.observe(canvas);

		const onVisibility = () => (document.hidden ? stop() : start());
		document.addEventListener("visibilitychange", onVisibility);

		const onLost = (e: Event) => {
			e.preventDefault();
			stop();
			setReady(false);
			unsupported.current?.();
		};
		canvas.addEventListener("webglcontextlost", onLost);

		measure();
		draw();
		start();

		return () => {
			stop();
			resize.disconnect();
			io.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
			canvas.removeEventListener("webglcontextlost", onLost);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
		};
	}, [loadKey, spanFrom, spanTo, still]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			data-ready={ready}
			className={`sk-canvas absolute inset-0 block size-full pointer-events-none ${className}`}
		/>
	);
}
