# OneWorld · Modo página convencional

Una página web normal, sin controles de videojuego: menú lateral, desplazamiento con el mouse, búsqueda por texto, filtros, fichas de detalle y tarjetas. Desarrollada con HTML5, CSS, Tailwind CSS (CDN) y JavaScript sin backend.

## Cómo abrirla

1. Abre el **`index.html` de la raíz del proyecto** con Live Server.
2. Elige **Modo página**.
3. Selecciona «Mi habitación», «Universo», «One Piece» o «Dragon Ball».
4. Usa el buscador y las pestañas de cada sección. Haz clic en «Ver ficha» para abrir detalles.
5. Para regresar al videojuego, utiliza **Modo interactivo** en el menú lateral.

También puedes abrir directamente `modo-pagina/index.html` con Live Server.

## Fuentes y transparencia de datos

| Sección | Fuente | Tipo |
| --- | --- | --- |
| One Piece · Frutas | `https://api.github.com/repos/fccview/devil-fruits-tracker/contents/scripts/data/fruits.json?ref=main` con respaldo raw del mismo repositorio | API GitHub REST / HTTPS público |
| One Piece · Personajes e islas | `https://www.onepieceapi.com/api/` (en el código original, con proxy HTTPS CORS) | API REST |
| Dragon Ball · Personajes | `https://dragonball-api.com/api/characters` | API REST paginada |
| Dragon Ball · Transformaciones | `https://dragonball-api.com/api/transformations` | API REST; las fichas complementarias se marcan LOCAL |
| Universo · Planetas, lunas, agujeros negros, exoplanetas, galaxias, asteroides | `https://spacecatalog.org/api/v1/objects` y `/search` | API REST paginada y búsqueda remota |
| Física · Fórmulas | `universo/js/physics.js`: 43 fórmulas escolares locales; Wikipedia y Wikidata para contrastar referencias y expresiones disponibles | LOCAL + APIs de referencia |
| Mi habitación | `mi-habitacion/js/datos-personales.js` | Personal y local, sin API |

El indicador **«API conectada» solo aparece después de recibir una respuesta satisfactoria** de la fuente. No se inventan registros si el proveedor está sin conexión. Cuando la API es paginada, se muestran los registros cargados y se pueden solicitar más. One Piece y Dragon Ball conservan los cargadores de sus mundos originales.

Los círculos y planetas usados para ilustrar astronomía son gráficos conceptuales, no imágenes científicas a escala. Los campos no proporcionados por las APIs se omiten. Las vistas previas de desarrollo pueden usar respuestas simuladas únicamente para pruebas, pero no forman parte de la aplicación publicada.

## Estructura

- `index.html` — estructura de la página convencional y Tailwind CSS por CDN.
- `css/pagina.css` — identidad visual, tarjetas, navegación responsive y animaciones.
- `js/app.js` — navegación, buscador, filtros, tarjetas, estados de conexión y fichas.
- `js/api-client.js` — conexión con las APIs, reutilizando los módulos del videojuego.

### Personalización

Tus datos personales **siguen exclusivamente en** `mi-habitacion/js/datos-personales.js` y se muestran automáticamente en ambos modos. No se duplican ni se vuelven a escribir en este modo. La fecha de nacimiento que incluyas allí será pública si publicas la página en GitHub Pages. Revísala antes de subir el proyecto.

## Compatibilidad

Funciona como sitio estático mediante Live Server o GitHub Pages con conexión a internet para Tailwind CDN, las fuentes y los proveedores externos. No requiere Python ni backend para ejecutarse. Algunas APIs pueden tener límites de solicitudes, cambios de formato, fallos temporales o reglas CORS; estas situaciones aparecen como errores con opción de reintentar.
