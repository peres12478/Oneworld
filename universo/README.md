# UNIVERSO — ASTRA/LAB · V2.22

Mundo espacial independiente de One Piece y Dragon Ball. Funciona sin Python, sin backend y con Live Server.

## Navegación

- Entrar desde el lobby de madera en la **primera puerta** (UNIVERSO).
- En el hangar, mover el **astronauta** con A/D, W o Espacio para saltar, Shift para correr y E al acercarte a una estación. También puedes pulsar las estaciones.
- **Cohete explorador:** A/D o flechas de pantalla cambian entre cuerpos celestes. 1/2/3 cambia planeta/luna/agujero negro; Q o E abre la ficha. «Cargar más» solicita la siguiente página.
- **Laboratorio:** filtra las fórmulas por rama y busca con Q; al abrir una ficha se consulta una explicación externa mediante Wikipedia API.
- **Arcade:** A/D mueve el cohete de juguete, F o Espacio dispara, puedes reiniciar cuando lo desees.
- Escape regresa al hangar (desde Prácticas, primero al Laboratorio). La puerta **MI ESPACIO**, al extremo izquierdo del hangar, permite volver con E; también está el enlace superior izquierdo.
- **Prácticas de física:** dentro del Laboratorio aparece una puerta que conduce a cinco simulaciones: tiro parabólico, segunda ley de Newton, ley de Hooke, péndulo y ley de Ohm. Ajusta las magnitudes con controles deslizantes y usa Iniciar / Pausar / Reiniciar.
- **Sonido:** botón 🔊 SONIDO ON/OFF en la barra superior. Música espacial original sintetizada y efectos de interacción mediante Web Audio API; el navegador solo permite iniciarlos tras una interacción del jugador.

## APIs, datos y limitaciones (importante para el proyecto escolar)

**API 1 — Astronomía:** https://spacecatalog.org/api

La consulta real se realiza desde `js/space-api.js` con `fetch('https://spacecatalog.org/api/v1/objects?category=planet|moon|black_hole&limit=24&offset=...')`, además de la ficha individual `/objects/{slug}`. La API documenta acceso público sin clave y CORS abierto; su servidor puede limitar solicitudes o fallar temporalmente. El juego indica si está conectada; si no, **no inventa resultados**. Las representaciones de los planetas y el agujero negro son ilustraciones CSS: **no son fotografías de la API ni representan distancias reales a escala**. Se muestran los campos que la API proporcione; no todos están presentes para todos los cuerpos. Los registros acreditan su fuente original cuando el campo está disponible.

**API 2 — Enciclopedia del laboratorio:** https://www.mediawiki.org/wiki/API:Main_page

Al inspeccionar una fórmula, el juego llama desde el navegador a la **API Action de Wikipedia en español** con `origin=*` y obtiene el resumen de un artículo asociado al tema. Los resúmenes externos se distinguen del contenido escolar.

**43 fórmulas escolares:** se encuentran en `js/physics.js`. Son un **catálogo didáctico local organizado y revisable** de física de 10.º/11.º, NO datos emitidos por una supuesta API pública de fórmulas. Cada ficha incluye nombre, fórmula, variables, alcance de aplicación y ejemplo. Cuando no responde Wikipedia, la ficha local sigue disponible y muestra un aviso.

## Estructura

- `index.html`: estructura del hangar, exploración, laboratorio, arcade y modales.
- `css/universo.css`: estilo propio; también se importa Tailwind por CDN en la interfaz.
- `js/main.js`: controles, navegación, animación del astronauta, mapas de consulta e interfaz.
- `js/space-api.js`: integración con SpaceCatalog y Wikipedia.
- `js/physics.js`: fórmulas curriculares locales.
- `js/asteroids.js`: minijuego independiente en Canvas 2D.
- `js/physics-practices.js`: cinco simuladores Canvas y cálculo de resultados en unidades SI.
- `js/astro-audio.js`: atmósfera espacial y efectos originales con Web Audio API.
- `assets/rocket.svg`: cohete original del universo, también usado en el hangar.

## Verificación

Se comprobaron la estructura de módulos, la sintaxis, la navegación de la tercera puerta, las vistas del nuevo mundo, la ficha de astronomía, el laboratorio y la lógica del arcade con **respuestas de API simuladas en un navegador aislado**. La ejecución completa en Edge/Live Server y el acceso a las APIs reales quedan para comprobar en tu computador, porque el navegador de este entorno no puede navegar a direcciones HTTP locales. Las imágenes previas del paquete se basan en datos de prueba, no en una llamada real.

No se modificaron archivos dentro de `one-piece/` ni de `dragon-ball/`.

## V2.22 — Revisión y conservación de datos

El laboratorio **mantiene las 43 fórmulas de `js/physics.js`** sin cambios de idioma ni simbología. Las prácticas nuevas son simulaciones educativas locales; NO se presentan como datos obtenidos desde una API. Se mantienen las consultas `fetch` a SpaceCatalog y Wikipedia. Los mundos `one-piece/` y `dragon-ball/` no han sido modificados. Las pruebas en Chromium se hicieron con carga aislada porque el navegador de este entorno bloquea `localhost`, por lo que hay que verificar Live Server en el PC del usuario.
