/**
 * Las piezas del mundo de OnPilot («Airglow»): la marca, la píldora y la
 * flecha. Mismas formas que el kit de las hermanas; la marca es «Órbita con
 * hueco» y su geometría vive una sola vez en `mark.ts`.
 */
import { useId } from "react";
import { ArrowRight } from "lucide-react";
import { MARK, MARK_COLORS, type MarkTone } from "./mark";

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
