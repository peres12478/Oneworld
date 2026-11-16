# Grand Line Explorer V2.14 · Puerto Pirata, Hachinosu y Franky

## Cómo ejecutar
Abre `index.html` desde Live Server en VS Code y úsalo en Microsoft Edge. El proyecto es un frontend estático (HTML, CSS, Tailwind CSS por CDN y JavaScript clásico), sin backend ni Python para ejecutarlo.

## Cambios V2.14
- Puerto marinero inspirado en el mundo de One Piece, mar, nubes, muelle, faro y tres barcos dibujados con SVG original:
  - Going Merry: ir a Hachinosu (x=520)
  - Oro Jackson: islas y personajes (x=1435)
  - Thousand Sunny: Frutas del Diablo (x=2980)
- Los 3 barcos del puerto y el Going Merry de retorno desde Hachinosu pueden romperse con F, siempre que el ataque esté dirigido y dentro del alcance. La tecla E abre un rompecabezas 3×3 cuando un barco está roto. El estado de reparación de cada barco es independiente.
- Easter egg de Franky: al romperse un barco se invoca al carpintero, cuya ilustración original aparece en el taller del puzzle. Al resolverlo, el barco vuelve a navegar; se conserva progreso parcial si se cierra el puzzle.
- Barbanegra: proyectiles, pinchos telegráficos y un agujero negro con advertencia que absorbe cada ~10 segundos. Tiene segunda fase.
- Derrota: risa de Barbanegra y regreso a selección con aviso «Has perdido; Barbanegra te espera en Hachinosu». En la próxima entrada el jefe inicia con su vida completa.
- Hachinosu usa música original de combate local (`assets/hachinosu-battle.ogg`, sintetizada para esta versión). El control de música y su volumen sigue estando en el dock.
- Botones Gear 5: son exclusivos de Luffy; nunca se muestran con Roger, incluso después de conseguir recompensas con Luffy.
- Se mantienen Gear 5 (F y G), Roger mejorado, ambos catálogos API, isla, rompecabezas, sonidos, controles táctiles y desbloqueos de la partida.

## Controles
A/D desplazarse · W/Espacio saltar · Shift correr · F atacar (barco/enemigo) · E subir al barco o reparar · T activar/desactivar Gear 5 (solo Luffy desbloqueado) · G Tambor de la Liberación (solo Gear 5).

## Guardado y sesiones
Las recompensas se conservan temporalmente en `sessionStorage`, no en `localStorage`, y se eliminan al pulsar «Nueva partida». Un comprobador de disponibilidad intenta detectar caídas de Live Server. **Importante:** un frontend estático no puede distinguir inequívocamente cada reinicio de Live Server de una simple recarga si el servidor se reinicia sin que el navegador detecte su interrupción. Para garantizarlo en todas las circunstancias se necesitaría que Live Server proporcione un identificador de ejecución, no disponible mediante archivos estáticos. No se promete reinicio infalible del progreso en ese caso.

## Notas
La música ambiental original sigue procediendo de Wikimedia Commons, con atribución a Kevin MacLeod (CC BY 3.0). La nueva pista de Hachinosu es una composición instrumental original generada para esta versión y no es una pista del anime.
Las ilustraciones de barcos y Franky son SVG locales originales con estilo de caricatura inspirados en los personajes y barcos de One Piece.

## Integración V2.15
Este mundo está íntegro en `one-piece/`. Se entra desde la puerta del nuevo `../index.html`. El enlace **INICIO / MUNDO PRINCIPAL** permite regresar sin modificar los módulos de juego.
