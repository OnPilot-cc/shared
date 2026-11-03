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

## Lo provisional

El mundo visual («Clear Sky» de noche, con su ámbar) es el de OnForge. El
subproyecto 2 de OnPilot define el mundo propio (UI como las otras cuatro
plataformas, sensación tecnológica/IA) y lo sustituye aquí. Hasta entonces las
piezas de `sky/reference.tsx` y los comentarios que hablan de partners y
developers son herencia sin consumidor.

Spec: `OnPilot.cc/docs/superpowers/specs/2026-11-02-onpilot-plataforma-design.md`.
