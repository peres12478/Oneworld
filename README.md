# Grand Line Explorer V2.25 — Mi habitación primero y GitHub simplificado

Sitio web con **cuatro puertas** y un astronauta animado. Construido con HTML, CSS, JavaScript y **Tailwind CSS por CDN**, sin backend ni Python. Continúa desde la V2.22, preservando los mundos de One Piece y Dragon Ball.

## Para ejecutar

1. Descomprime todo el ZIP sin cambiar los nombres ni la estructura.
2. Abre la carpeta principal en Visual Studio Code.
3. Abre el **`index.html` de la raíz** usando Live Server en Edge o Chrome.
4. Pulsa **A/D** para caminar, **W / Espacio** para saltar, **Shift** para correr y **E** para entrar. También puedes hacer clic en las puertas.
5. La **música comienza después de un clic o de una tecla**, por las políticas de reproducción automática de los navegadores. Hay botones de Música y controles de volumen independientes.

## Las cuatro puertas (de izquierda a derecha)

1. **Mi habitación** → `mi-habitacion/`: información personal; **no usa API**.
2. **Universo** → `universo/`: cohete, API astronómica, laboratorio de 43 fórmulas, cinco prácticas y arcade.
3. **One Piece** → `one-piece/`: Luffy, Roger, barcos, Hachinosu y APIs.
4. **Dragon Ball** → `dragon-ball/`: Goku, Vegeta, Freezer y APIs.

## Cómo editar tu información: UN SOLO ARCHIVO

Abre: **`mi-habitacion/js/datos-personales.js`**. Puedes editarlo con Visual Studio Code y guardar. No necesitas modificar el HTML, ni las animaciones, ni los tres mundos.

- **GitHub:** escribe el nombre visible en `github.nombre` y el único enlace en `github.url` (ejemplo: `https://github.com/tu-usuario?tab=repositories`). No se muestran proyectos destacados ni tarjetas adicionales. El enlace abre tus repositorios en GitHub.
- **Mis pasiones:** escribe el texto inicial en `pasiones.introduccion` y objetos en `pasiones.intereses`: `{ nombre: 'Mi pasión', descripcion: 'Por qué me gusta' }`. Esta sección se abre al pulsar el recuadro de Saturno.
- **Sobre mí:** completa `sobreMi.nombre`, `sobreMi.fechaNacimiento` (`AAAA-MM-DD`, opcional), `sobreMi.presentacion`. Esta sección se abre al pulsar el reloj.

**No se incluyen datos personales reales de ejemplo.** Si publicas el proyecto en GitHub Pages u otro alojamiento, todos los datos del archivo serán públicos. No escribas cédula, teléfonos, contraseñas ni información privada.

## Controles en la habitación

- **A/D:** caminar; **W/Espacio:** saltar; **Shift:** correr.
- **E:** interactuar con el elemento cercano; **Esc:** cerrar una ficha.
- También puedes hacer **clic** en el computador, Saturno, reloj o puerta de salida.
- El portal **MI ESPACIO** devuelve al mundo principal.

## Sonido de cada mundo

- `assets/mi-espacio-original.ogg` — tema original del lobby principal.
- `assets/mi-habitacion-original.ogg` — tema cálido de la habitación.
- `universo/assets/cosmos-original.ogg` — música espacial continua de ASTRA/LAB.
- `js/personal-music.js` — reproductor compartido de Mi espacio y Mi habitación.
- `universo/js/space-music.js` — reproductor y volumen de la música del Universo.
- `universo/js/astro-audio.js` — mantiene los efectos de salto e interacción. Se evitó solapar las antiguas notas de ambiente con la nueva música.

Todas las pistas fueron sintetizadas para este proyecto; no requieren API, archivos externos ni música comercial. Las conexiones de las **APIs de los otros mundos no se han modificado**.

## Títulos / diseño

Se redujeron los encabezados de Universo, especialmente «El universo te espera» y los títulos de paneles. Se mantiene Tailwind CSS por CDN, complementado con CSS de escenarios (`css/lobby.css`, `universo/css/universo.css` y `mi-habitacion/css/habitacion.css`).

## Notas de verificación

- One Piece y Dragon Ball se conservan **idénticos a la V2.22**.
- Las fichas personales muestran avisos cuando faltan datos; no inventan información ni enlaces.
- Los enlaces externos admiten `http` y `https`; se abren con `rel="noopener noreferrer"`.
- La prueba del navegador fue **aislada**, usando contenido inyectado y datos locales; el acceso de Chromium a `localhost` está bloqueado en este entorno. Verifica el flujo completo y las APIs reales con Live Server en tu computador.

## Cambios V2.24 — Mi habitación

- Se rediseñó la ventana: cielo nocturno continuo, luna, estrellas, montañas y marco arqueado con travesaños integrados.
- El reloj de «Sobre mí» se centró más abajo en su cuadro.
- Se eliminaron los encabezados «PROYECTOS DESTACADOS» y «MI HISTORIA», así como el campo `sobreMi.historia`. La ficha de GitHub se simplificó en V2.25 a un nombre y un enlace; «Sobre mí» conserva nombre, fecha y presentación.

## Cambios V2.24 — API del laboratorio

**Aclaremos el origen:** las 43 fórmulas del catálogo de décimo y once siguen siendo datos escolares locales (`universo/js/physics.js`). No se presentan como contenido descargado de una API.

- Al **entrar al laboratorio** se consulta automáticamente Wikipedia API mediante `fetch()` y se busca la vinculación de sus temas con **Wikidata**.
- Se consultan en Wikidata las expresiones matemáticas registradas con la propiedad `P2534` («defining formula»). Si existe una expresión, se muestra como contenido **obtenido desde Wikidata**, separado de la fórmula escolar original.
- El estado visible muestra «consultando», «API conectada» o «API sin conexión». El botón **COMPROBAR API** repite la prueba.
- Se muestra cuántas fórmulas tienen referencia externa y cuántas expresiones matemáticas devuelve realmente Wikidata. El número puede ser cero; no se inventan resultados ni registros.
- Al abrir una ficha continúa la consulta real del resumen enciclopédico mediante Wikipedia API.
- Todas las fichas locales y las cinco prácticas siguen disponibles sin internet.

**Módulo nuevo:** `universo/js/physics-live-api.js` implementa las peticiones a Wikipedia y Wikidata. No usa Python ni backend. El CDN de Tailwind permanece incluido.

**Pruebas:** verificación sintáctica y pruebas aisladas en Chromium con respuestas de API **simuladas** (éxito y contenido). No fue posible comprobar tráfico real de Wikimedia desde este entorno: valida el resultado con Live Server en Edge.

## Cambios V2.25

- Mi habitación pasa a ser la **primera puerta**, seguida de Universo, One Piece y Dragon Ball. El orden visual, los números y el orden de navegación por teclado coinciden.
- En **Mi GitHub** aparecen únicamente `github.nombre` y `github.url`. Se eliminó por completo la lista de proyectos destacados (`proyectos`).
- Se mantienen las secciones **Mis pasiones**, introducción, intereses y **Sobre mí**.
- Los archivos de `one-piece/`, `dragon-ball/` y `universo/` no se modificaron.
