# Grand Line Explorer V2.9 — Habilidades y puertas reconstruibles

Proyecto frontend puro con **HTML, CSS, JavaScript vanilla y Tailwind por CDN**. No necesita Python ni Node.js para ejecutar el juego. Se conserva la versión 2.8 con música, frutas, islas y biografías.

## Ejecutar en Microsoft Edge

1. Extraer `Grand_Line_Explorer_v2_9_Habilidades_Puertas.zip`.
2. Abrir esta carpeta en VS Code.
3. Botón derecho en `index.html` → **Open with Live Server**.
4. Abrir el enlace que muestre Live Server. Normalmente `http://127.0.0.1:5500/`.
5. Seleccionar Luffy o Gol D. Roger.

## NUEVO: habilidades de combate en la sala inicial

- **F:** habilidad especial, con un pequeño tiempo de recuperación.
- **Luffy:** un brazo de goma se extiende y lanza un puñetazo horizontal; a continuación se retrae.
- **Gol D. Roger:** desenfunda una espada con corte animado, estela luminosa y rayos de Haki **estilizados**.
- **Dirección:** el efecto siempre apunta hacia donde mira el personaje.
- **Puertas:** al recibir un golpe dentro del alcance, cualquiera de las dos puertas puede romperse. No basta estar lejos o atacar en sentido contrario.
- **Easter egg:** al romper una puerta aparece un rompecabezas de nueve piezas. Selecciona dos para intercambiarlas; a la derecha hay una referencia visual. Al completarlo se reconstruye el portal y podrás entrar como antes.
- Puedes cerrar el rompecabezas con la **X**, el botón **REPARAR DESPUÉS** o **Esc**. La puerta sigue rota; acércate y pulsa **E** para volver a abrir la reparación. **El progreso se conserva** dentro de la misma sesión. **MEZCLAR DE NUEVO** cambia el reto.
- En móvil hay un botón **F** junto a las flechas para activar la habilidad.

Las habilidades están limitadas a **la sala principal**, no se lanzan dentro del atlas de frutas ni de las islas. No se modificaron las consultas ni la configuración de APIs.

## Controles existentes

| Ubicación | Tecla | Acción |
|---|---|---|
| Sala | A/D o flechas | Caminar izquierda/derecha |
| Sala | W o Espacio | Saltar |
| Sala | Shift | Correr |
| Sala | F | Usar habilidad especial |
| Sala | E cerca de una puerta intacta | Entrar |
| Sala | E cerca de una puerta rota | Abrir rompecabezas |
| Atlas de frutas | WASD / E / Q | Moverse / inspeccionar / buscar |
| Mundo de islas | A/D / E / Esc | Moverse / inspeccionar / volver |

## ¿De dónde proceden las biografías?

**No todas provienen de la API**:

1. La API puede ofrecer una descripción incluida en `raw.extra_data` (`description`, `biography`, `bio`, `summary`, `about`); se prioriza y etiqueta **Descripción proporcionada por la API**.
2. El archivo local `js/character-descriptions.js` contiene **122 reseñas editoriales originales escritas para el juego**, etiquetadas **Reseña editorial del juego**. No son respuestas textuales de la API ni citas académicas. Si requieres trazabilidad histórica personaje por personaje, hay que añadir referencias comprobadas.
3. Para otros personajes se sintetizan los campos de origen, ocupación y afiliación que vienen en la API; aparece **Resumen basado en los datos de la API**.

Las fichas principales de personajes se obtienen de **One Piece API REST** y los datos de las frutas del catálogo **Devil Fruits Tracker**, como en V2.8. Las asociaciones entre personajes e islas son editoriales del juego. El frontend usa `fetch` y cuando corresponde un intermediario HTTPS `proxy.cors.dev`; este servicio remoto puede fallar o aplicar límites. Se conservó el manejo de errores de la versión 2.8.

## Organización de archivos nuevos

- `js/abilities.js`: extensión del puño y corte de Roger; tiempo de recuperación, dirección, hitboxes e impacto.
- `css/abilities.css`: tratamiento visual del ataque y la puerta dañada.
- `js/door-puzzle.js`: estado de las dos puertas y rompecabezas de nueve piezas con intercambio de casillas.
- `css/door-puzzle.css`: menú de reconstrucción responsive.
- `assets/portal-puzzle.svg`: ilustración original del portal usada como rompecabezas.
- `js/room.js`: integración con **F**, detección de puerta rota y pausa del movimiento durante el rompecabezas.

Los demás archivos de la versión 2.8 se mantienen separados por función.

## Pruebas y alcance

Se validó la sintaxis de todos los módulos JavaScript y se probó en Chromium mediante respuestas externas simuladas: pulsación de **F**, extensión del brazo de Luffy, corte de Roger, rotura de puerta, resolución real de las nueve piezas, restauración y conservación del estado de puerta rota al cerrar el menú. No hubo errores de JavaScript en la prueba completada. La conectividad real de música, personajes y frutas depende de las APIs y debe probarse en Edge con Live Server.
