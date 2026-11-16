# OneWorld Develop · Versión 2.26 — Dos modos

Este paquete parte de **`Oneworld-Develop.zip`** recibido del usuario y conserva sus datos personales.

## ¿Qué cambió?

Al abrir el `index.html` de la raíz aparece una pantalla con dos opciones:

- **Modo interactivo:** lleva a `modo-interactivo.html`. Es el mismo lobby del astronauta y conserva los cuatro destinos, personajes, enemigos, recompensas, sonidos y minijuegos anteriores.
- **Modo página:** lleva a `modo-pagina/index.html`. Es una web convencional con barra de navegación, contenido desplazable verticalmente, buscadores, filtros, tarjetas y fichas. No requiere jugar ni utilizar WASD.

### Contenido del modo página

1. **Mi habitación:** GitHub, introducción, pasiones, intereses y «Sobre mí». Usa exactamente los datos presentes en `mi-habitacion/js/datos-personales.js`.
2. **Universo:** planetas, lunas, agujeros negros, exoplanetas, galaxias, asteroides y el catálogo de fórmulas de física.
3. **One Piece:** Frutas del Diablo, personajes e islas.
4. **Dragon Ball:** personajes y transformaciones.

La web consulta las mismas APIs que el proyecto original. Cada conexión presenta su estado, conteo de registros o error; nunca sustituye una respuesta fallida por datos ficticios. Más información sobre orígenes y archivos en [`modo-pagina/README.md`](modo-pagina/README.md).

## Instrucciones de ejecución

1. Descomprime el ZIP completo.
2. Abre la carpeta resultante en VS Code.
3. Ejecuta **el `index.html` de la raíz** con Live Server (no el HTML de un mundo).
4. Selecciona **Modo interactivo** o **Modo página**.
5. En ambos modos puedes volver y cambiar el modo desde los controles de navegación.

No se necesita backend Python. La navegación a los mundos del juego funciona con las mismas rutas de la versión anterior. Al volver desde una dimensión interactiva, se abre de nuevo el lobby del juego; al visitar la raíz directamente, aparece el selector de modos.

## Archivos principales

```text
index.html                          # NUEVO selector de dos modos
modo-interactivo.html               # Lobby jugable original (misma estructura)
modo-pagina/
  index.html                        # Web convencional Tailwind
  css/pagina.css
  js/app.js
  js/api-client.js
  README.md
mi-habitacion/
  js/datos-personales.js            # Tus datos conservados sin cambios
one-piece/                          # Mundo del juego intacto
dragon-ball/                        # Mundo del juego intacto
universo/                           # Mundo del juego intacto
```

## Nota de publicación

La habitación es una sección pública cuando subes el sitio a internet. Revisa tu nombre, fecha de nacimiento y otros datos en `mi-habitacion/js/datos-personales.js`. No subas credenciales, números de identidad ni datos privados. La música y los recursos locales se conservaron en el paquete.
