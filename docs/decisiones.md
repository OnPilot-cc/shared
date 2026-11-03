# Decisiones de `@onpilot/shared`

Único archivo del repo autorizado a nombrar el origen del fork.

## Origen (2026-11-02)

- Copia de `OnForge.cc/shared` en el commit `ce6f28f` (paquete `@onforge/shared`
  1.4.0), sin `.git`, `node_modules` ni artefactos.
- Renombrado por bytes, de más específica a más genérica:
  `@onforge/shared→@onpilot/shared`, `OnForge-cc/shared→OnPilot-cc/shared`,
  `OnForge Identity→OnPilot Identity`, `OnForge Admin→OnPilot Admin`,
  `onforge.cc→onpilot.cc`, `ONFORGE→ONPILOT`, `OnForge→OnPilot`,
  `onforge→onpilot`.
- La versión vuelve a `1.0.0`: es el primer paquete de OnPilot.
- `platformOrigin()` en localhost apunta a `http://localhost:8800` (puerto de
  `wrangler pages dev` de onpilot; los puertos de la familia no se pisan).

## El mundo «Airglow» (2026-11-03)

El subproyecto 2 sustituye el «Clear Sky» de noche heredado (su ámbar, su
núcleo con órbita inclinada) por «Airglow»: página clara, noche en paneles,
un acento violeta, Geist con Geist Mono acotada. `styles/sky.css` se re-basó
sobre el de Northstar («Polar Night»), que ya tenía la forma «página clara +
noche en paneles» y el mismo vocabulario de clases que el de OnForge; se
tradujeron sus colores y se añadieron las piezas propias de OnPilot (`sk-mono`,
la barra lateral). Spec:
`OnPilot.cc/docs/superpowers/specs/2026-11-03-onpilot-mundo-airglow-design.md`.

Spec: `OnPilot.cc/docs/superpowers/specs/2026-11-02-onpilot-plataforma-design.md`.
