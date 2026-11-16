# Grand Line Explorer V2.22 — Mi espacio + One Piece + Dragon Ball + Universo

Proyecto web completo: HTML, CSS, JavaScript nativo y Tailwind CSS mediante CDN. No requiere Python ni backend local para funcionar.

## Inicio

1. Descomprime **todo** el ZIP manteniendo la estructura de carpetas.
2. Abre la **carpeta principal** en Visual Studio Code.
3. Abre el `index.html` de la **raíz** usando Live Server en Microsoft Edge o Chrome.
4. Usa **A / D** para caminar, **W / Espacio** para saltar, **Shift** para correr y **E** cerca de una puerta. También puedes pulsar directamente en los accesos.

## Orden de las puertas (izquierda → derecha)

1. **UNIVERSO** (`universo/`): astronomía, laboratorio de física y arcade de asteroides.
2. **ONE PIECE** (`one-piece/`): Luffy, Roger, puertos, Hachinosu y API.
3. **DRAGON BALL** (`dragon-ball/`): Goku, Vegeta, Freezer y API.

El personaje del mundo principal es **el mismo astronauta de traje blanco y visor azul** que se usa en el hangar de ASTRA/LAB. Su SVG está incrustado en `index.html`, y la animación está en `css/lobby.css`.

## Novedades en Universo V2.22

- **Regreso a Mi Espacio:** portal físico situado a la izquierda del hangar; puedes acercarte y pulsar E. El enlace superior también se conserva.
- **Ambiente sonoro:** notas y efectos originales sintetizados en el navegador con Web Audio API, control de ON/OFF y sonidos de interacción, saltos, inspección y arcade. Por las restricciones de los navegadores, el sonido se inicia tras el primer clic o tecla.
- **Laboratorio → Prácticas:** nueva puerta dentro del laboratorio de fórmulas. Lleva a una sala con cinco experimentos interactivos: tiro parabólico, segunda ley de Newton, ley de Hooke, péndulo y ley de Ohm. Cada experimento incluye magnitudes ajustables, ecuación, visualización en Canvas, resultados calculados y botones Iniciar / Pausar / Reiniciar.
- **Fórmulas:** el catálogo de 43 fórmulas escolares sigue igual (sin traducciones), en `universo/js/physics.js`; las prácticas son modelos didácticos locales, no registros de una API.

## API y fuentes

Se mantienen las conexiones `fetch()` existentes: `universo/js/space-api.js` para SpaceCatalog y Wikipedia; `dragon-ball/js/db-api.js` y los módulos API de One Piece. Ninguna de las consultas se reemplazó por respuestas falsas. Si no hay red, los servicios pueden indicar falta de conexión.

## Archivos principales

- `index.html` / `css/lobby.css` / `js/lobby.js` / `js/lobby-config.js`: mundo personal y las tres puertas.
- `universo/index.html` / `universo/css/universo.css`: interfaces y estilos de ASTRA/LAB.
- `universo/js/main.js`: navegación y controles del universo.
- `universo/js/physics-practices.js`: cálculos y dibujos de las cinco prácticas.
- `universo/js/astro-audio.js`: sonido ambiental original y efectos.
- `universo/js/physics.js`: las 43 fórmulas escolares preexistentes.
- `universo/js/space-api.js`: APIs externas del Universo.
- `one-piece/` y `dragon-ball/`: proyectos integrados **sin modificaciones respecto a V2.21**.

## Comprobaciones

Se verificó sintaxis JavaScript, integridad del ZIP y equivalencia binaria de las carpetas de One Piece y Dragon Ball respecto a la V2.21. Las pruebas de interacción en Chromium fueron **aisladas** (sin navegación a servidor local, bloqueada por el entorno) y confirmaron cinco prácticas, ajustes de parámetros, regreso al laboratorio, botones y orden de puertas. **Debes validar la ejecución con Live Server y las llamadas reales a las APIs en tu computador.**
