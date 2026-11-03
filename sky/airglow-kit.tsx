/**
 * Las piezas que Airglow añade al kit de la casa, sacadas de lo que el mundo
 * tomó en su ronda de dirección:
 *
 * - `ItemLabel`: una sola etiqueta para todo, herramienta · tipo · hora, en
 *   Geist Mono (lo que mide el agente), con la hora en el acento. La misma en
 *   las demostraciones del sitio y, más adelante, en la vista del día, la
 *   bandeja, los avisos y los correos.
 * - `DayLine`: la versión rápida del día, la frase de una línea («For today
 *   you have 2 projects due…»), una pieza propia que más adelante viaja al
 *   resumen, al asunto del correo y al aviso.
 * - `ExampleSeam`: la costura honesta. Toda demostración la lleva a la vista,
 *   como parte del diseño; el texto lo pasa quien la monta, ya traducido.
 */
import type { ReactNode } from "react";

export function ItemLabel({ tool, kind, time }: { tool: string; kind: string; time: string }) {
	return (
		<span className="sk-item-label sk-mono">
			{tool} · {kind} · <time>{time}</time>
		</span>
	);
}

export function DayLine({ children }: { children: ReactNode }) {
	return <p className="sk-dayline">{children}</p>;
}

export function ExampleSeam({ label }: { label: string }) {
	return <span className="sk-seam">{label}</span>;
}
