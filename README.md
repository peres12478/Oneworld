# Grand Line Explorer V2.18 — Cápsulas de Namek y mapas de Dragon Ball API

## Cómo abrir el proyecto

1. Descomprime el ZIP completo sin mover archivos.
2. En VS Code abre **la carpeta raíz** del proyecto.
3. Ejecuta **`index.html` de la raíz** con Live Server en Microsoft Edge o Chrome.
4. Desde el escenario del stickman blanco entra en la puerta de **Dragon Ball** (esfera de cuatro estrellas). La puerta **One Piece** sigue disponible.

No hace falta Python ni backend para ejecutar el videojuego. HTML, CSS, JavaScript y **Tailwind CSS mediante CDN** se usan en la interfaz.

## One Piece: única modificación solicitada

Se eliminaron las cuatro plataformas cafés elevadas del puerto. También se eliminó su lógica de colisión, para que solo se use el suelo del muelle. **El resto de la carpeta `one-piece/` es idéntico a V2.17.** Se verificó por comparación binaria: de sus 74 archivos, únicamente cambiaron `index.html`, `css/room.css` y `js/room.js`.

## Nuevo mundo de Dragon Ball

- **Goku y Vegeta** seleccionables como stickman, con extremidades animadas en archivos SVG independientes.
- El puerto de Namek tiene **tres cápsulas Saiyajin**: **Freezer**, **Personajes API** y **Transformaciones API**; a la derecha hay una salida al mundo inicial.
- **Combate**: entrar en la cápsula de Freezer abre una arena separada. El enemigo tiene tres fases, incluyendo cuernos, cabeza alargada y forma final lisa; las tres ilustraciones se redibujaron con estilo stickman y cola.
- La fase II habilita el Super Saiyajin provisional (**T**); la III requiere Super Saiyajin para recibir daño.
- Al vencer, se guarda la transformación de Goku o Vegeta (según el vencedor). Al perder, se regresa **al puerto** y la cápsula permite iniciar otra pelea desde cero, con la vida completa. Una transformación no conseguida permanece bloqueada.
- **F** dispara Ki; **G** (solo Super Saiyajin) libera **Kamehameha** de Goku o **Masenko** de Vegeta con 10 segundos de recarga.
- La barra superior indica **API CONECTADA / PARCIAL / SIN CONEXIÓN** y cuenta los registros recibidos realmente. Botón **↻ API** reintenta.
- Al viajar a Personajes o Transformaciones, sus fichas se distribuyen en un mapa. Se explora con **A/D**, **E** inspecciona el registro cercano y **Q** abre el buscador con la pose de pensar y los brazos cruzados. Elegir un resultado lleva a esa ficha. Las fichas usan la imagen y datos devueltos por la API y un panel emergente, no texto largo debajo de la cuadrícula.
- **Música instrumental original** distinta para puerto y combate (`namek-adventure.ogg`, `namek-battle.ogg`) y controles de música ON/OFF. **Web Audio API** genera sonidos propios de disparos, golpes, salto, transformaciones y Kamehameha/Masenko. No se incluyó música ni sonidos oficiales de la serie.

## Controles

| Tecla | Acción |
|---|---|
| A / D | Caminar en mundo horizontal |
| Shift | Correr |
| W / Espacio | Saltar |
| E | Entrar en cápsula, regresar, inspeccionar ficha |
| Q | Buscar personaje/transformación en mapa |
| F | Lanzar Ki en combate |
| T | Activar/desactivar Super Saiyajin desbloqueado |
| G | Kamehameha / Masenko en modo Super Saiyajin (10 s) |
| Esc | Cerrar buscador o ficha |

También existen controles táctiles para móvil y **⇄ Guerrero** para volver a elegir protagonista fuera del combate.

## Integración con API real (trabajo académico)

**URL base:** `https://dragonball-api.com/api`

- `GET /characters?limit=100`: listado real de personajes; recorre las páginas `links.next` hasta terminarlas.
- `GET /transformations?limit=100`: listado real de transformaciones; también recorre la paginación cuando la API la entregue.
- `GET /characters/{id}`: datos individuales, planeta de origen y transformaciones relacionadas.
- `GET /transformations/{id}`: determina el **portador confirmado por la API** cuando la ficha individual devuelve `character`. La colección global no asigna necesariamente el portador; no se inventan propietarios a partir de IDs.
- Los datos se obtienen en tiempo real con `fetch()`, sin muestras precargadas como respuestas ficticias.
- Nueve fichas complementarias de transformaciones se muestran, si procede, **claramente señaladas como contenido local**, no datos de la API.
- Si hay errores de red, HTTP o CORS, aparece un estado de error y la opción de reintentar, sin simular una conexión.

Documentación: https://dragonball-api.com/api-docs

## Archivos principales

```text
index.html                                mundo principal: One Piece + Dragon Ball
js/lobby.js                               puertas e interacción del mundo principal
one-piece/                                mundo anterior (solo se retiraron las plataformas)
dragon-ball/index.html                    puerto, arena, explorador y fichas
 dragon-ball/js/dragon-ball.js            navegación, combate, catálogos, búsqueda, HUD
 dragon-ball/js/db-api.js                 fetch de la API y datos complementarios
 dragon-ball/js/db-audio.js               audio original y efectos Web Audio
 dragon-ball/css/dragon-ball-v218.css     estilo del nuevo mundo, rig stickman y mapas
 dragon-ball/assets/*-body.svg           capas base del stickman
 dragon-ball/assets/*-arm-*.svg          brazos animados
 dragon-ball/assets/*-leg-*.svg          piernas animadas
 dragon-ball/assets/namek-*.ogg          dos músicas originales, locales
```

## Verificación y limitaciones

- Sintaxis JavaScript validada con Node.
- Pruebas de interacción en **Chromium cargado de manera aislada** con respuestas simuladas de API: selección, entrada a cápsula, tres fases, desbloqueo, transformación, mapa, Q, ficha, derrota, regreso al puerto, nuevo combate y movimiento tras perder; no aparecieron excepciones JS.
- No se pudo ejecutar Live Server en el navegador del entorno, que bloquea las direcciones locales y `file://`; debes comprobarlo en Edge con tu conexión a internet. La conexión externa a la API tampoco se validó directamente desde ese navegador: los contadores de pruebas simuladas no representan registros reales.
- El progreso usa `sessionStorage` y detecta desconexiones de Live Server para reiniciar al reconectar. Como Live Server no ofrece un identificador de ejecución, un reinicio demasiado rápido puede pasar inadvertido; el botón **Nueva partida** elimina las recompensas manualmente.


## V2.19 — Diseños proporcionados y esfera gravitatoria (Dragon Ball)

- Personajes y naves: se sustituyeron ilustraciones genéricas por las seis imágenes aportadas por el usuario. Los archivos nuevos están en `dragon-ball/assets/` en PNG con fondo transparente.
- Goku y Vegeta conservan sus trajes; la versión Super Saiyajin tiene pelo dorado y mantiene la silueta del original. Tecla `T` tras desbloqueo.
- Freezer usa ilustración diferente en cada una de sus tres fases (primera con cuernos laterales, segunda con cuernos grandes y forma final lisa).
- Tres cápsulas Saiyajin esféricas llevan al combate, catálogo de personajes y catálogo de transformaciones.
- Nuevo ataque **Esfera de la Muerte**, exclusivo de Freezer fases 2 y 3. Se carga durante 3 segundos, atrae al héroe durante la carga y sale disparado; un impacto causa 3 puntos de daño (sobre 8 de vida inicial). Cadencia aproximada: cada 11,5 s en fase 2 y 10 s en fase 3, con primer ataque adelantado tras la transformación. Audio Web Audio original y señales visuales de aviso. Saltar o escapar del recorrido permite esquivarla.
- No se ha alterado ningún archivo en `one-piece/` ni los endpoints de Dragon Ball API.

**Ejecución:** abrir `index.html` raíz con Live Server en un navegador, sin Python ni backend local.
