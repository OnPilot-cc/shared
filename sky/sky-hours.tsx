import { useEffect, useRef, useState } from "react";
import { DAY_SPAN, bandPoint, hourToX } from "./airglow";

/**
 * Las horas de la banda, en DOM y en Geist Mono (lo que mide el agente): el
 * shader no escribe texto. Se colocan sobre la misma curva que pinta el lienzo
 * (`bandPoint`), un poco por encima, midiendo el panel que las contiene. Son
 * decorativas (`aria-hidden`): la hora de cada cosa se dice en su etiqueta.
 */
export function SkyHours({ span = DAY_SPAN, every = 2 }: { span?: [number, number]; every?: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<{ w: number; h: number } | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const hours: number[] = [];
	for (let hr = Math.ceil(span[0] + 1); hr < span[1]; hr += every) hours.push(hr);

	return (
		<div ref={ref} aria-hidden="true" className="sk-hours pointer-events-none absolute inset-0">
			{hours.map((hr) => {
				const at = size ? bandPoint(hourToX(hr, span), size.w, size.h) : null;
				return (
					<span
						key={hr}
						className="sk-mono sk-hour absolute"
						style={at ? { left: at.x, top: at.y - 22, transform: "translateX(-50%)" } : { visibility: "hidden" }}>
						{String(hr).padStart(2, "0")}
					</span>
				);
			})}
		</div>
	);
}
