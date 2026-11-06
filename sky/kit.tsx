/**
 * Las piezas del mundo de OnPilot («Airglow»): la marca, la píldora y la
 * flecha. Mismas formas que el kit de las hermanas; la marca es «Órbita con
 * hueco» y su geometría vive una sola vez en `mark.ts`.
 */
import { useId } from "react";
import { ArrowRight } from "lucide-react";
import { MARK, MARK_COLORS, type MarkTone } from "./mark";
import { ION_COLORS, ION_DISC_STOPS, ION_MARK, type IonTone } from "./ion-mark";

/** La marca: núcleo de tinta, aro abierto y el punto en el hueco. `tone="night"` sobre el cielo. */
export function Mark({ className = "size-6", tone = "day" }: { className?: string; tone?: MarkTone }) {
	// useId trae caracteres que una referencia url(#…) de SVG no admite.
	const id = `opm${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
	const c = MARK_COLORS[tone];
	return (
		<svg viewBox={MARK.viewBox} className={className} aria-hidden="true">
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={c.core[0]} />
					<stop offset="1" stopColor={c.core[1]} />
				</linearGradient>
			</defs>
			<path d={MARK.ring.d} fill="none" stroke={c.ring} strokeWidth={MARK.ring.width} strokeLinecap="round" />
			<circle cx={MARK.core.cx} cy={MARK.core.cy} r={MARK.core.r} fill={`url(#${id})`} />
			<circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={c.dot} />
		</svg>
	);
}

/**
 * El símbolo de Ion, «Limbo»: el disco de noche y su borde encendido. `tone="night"`
 * sobre el cielo; `tone="mono"` en `currentColor`, sin halo, para huecos pequeños.
 * El arco lleva `sk-ion-arc`: el CSS lo hace latir dentro de un `IonGlyph` que escribe.
 */
export function IonMark({ className = "size-6", tone = "day" }: { className?: string; tone?: IonTone | "mono" }) {
	const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
	const disc = `iond${uid}`;
	const soft = `ions${uid}`;
	const { cx, cy, r } = ION_MARK.disc;
	if (tone === "mono") {
		return (
			<svg viewBox={ION_MARK.viewBox} className={className} aria-hidden="true">
				<circle cx={cx} cy={cy} r={r} fill="currentColor" opacity={0.35} />
				<path className="sk-ion-arc" d={ION_MARK.arc.d} fill="none" stroke="currentColor" strokeWidth={ION_MARK.arc.width} strokeLinecap="round" />
			</svg>
		);
	}
	const c = ION_COLORS[tone];
	return (
		<svg viewBox={ION_MARK.viewBox} className={className} aria-hidden="true">
			<defs>
				{c.disc.length > 1 && (
					<radialGradient id={disc} cx="50%" cy="20%" r="80%">
						{c.disc.map((color, i) => (
							<stop key={color} offset={ION_DISC_STOPS[i]} stopColor={color} />
						))}
					</radialGradient>
				)}
				<filter id={soft} filterUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
					<feGaussianBlur stdDeviation={ION_MARK.blur} />
				</filter>
			</defs>
			<circle cx={cx} cy={cy} r={r} fill={c.disc.length > 1 ? `url(#${disc})` : c.disc[0]} />
			<path
				className="sk-ion-arc"
				d={ION_MARK.arc.d}
				fill="none"
				stroke={c.halo}
				strokeWidth={c.haloWidth}
				strokeLinecap="round"
				opacity={c.haloOpacity}
				filter={`url(#${soft})`}
			/>
			<path d={ION_MARK.arc.d} fill="none" stroke={c.arc} strokeWidth={ION_MARK.arc.width} strokeLinecap="round" />
		</svg>
	);
}

/** Ion junto a sus respuestas: el símbolo en un círculo blanco; `writing` hace latir su borde mientras escribe. */
export function IonGlyph({ writing = false, className = "" }: { writing?: boolean; className?: string }) {
	return (
		<span className={`sk-ion-glyph ${className}`} data-writing={writing ? "true" : "false"} aria-hidden="true">
			<IonMark className="size-4" />
		</span>
	);
}

/** La marca con su nombre, en Geist 500. Hereda el color de quien la monta. */
export function Wordmark({ href, className = "", tone = "day" }: { href: string; className?: string; tone?: MarkTone }) {
	return (
		<a
			href={href}
			className={`inline-flex items-center gap-2 rounded-full -ml-1 px-1 py-1 text-[1.125rem] font-medium tracking-[-0.02em] no-underline ${tone === "night" ? "text-(--sk-night-ink)" : "text-(--sk-ink)"} ${className}`}>
			<Mark tone={tone} />
			OnPilot
		</a>
	);
}

export function SkArrow({ className = "size-4" }: { className?: string }) {
	return <ArrowRight className={`sk-arrow shrink-0 ${className}`} strokeWidth={1.75} aria-hidden="true" />;
}

/** Una píldora como enlace. `primary` (de tinta; sobre el cielo, invertida) es la única acción primaria de cada vista. */
export function SkButton({
	href,
	children,
	variant = "primary",
	size = "md",
	className = "",
}: {
	href: string;
	children: React.ReactNode;
	variant?: "primary" | "quiet" | "glass";
	size?: "md" | "sm";
	className?: string;
}) {
	return (
		<a href={href} className={`sk-btn sk-btn--${variant} ${size === "sm" ? "sk-btn--sm" : ""} ${className}`}>
			{children}
		</a>
	);
}
