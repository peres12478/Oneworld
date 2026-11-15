/*
 * Pose de brazos cruzados: ilustración articulada, NO dos barras CSS.
 * Reutiliza cabeza/tronco/piernas recortados de las imágenes del usuario y dibuja
 * las mangas, codos, antebrazos y manos sobre el torso mediante SVG.
 * Cada personaje tiene una pose anatómica con distintos puntos de articulación.
 */
(function () {
  'use strict';
  const OP = window.OP;
  const U = OP.util;
  const poses = {
    luffy: {
      viewBox: '0 0 389 759',
      artwork: `
        <g stroke="#452329" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">
          <!-- Brazo derecho: hombro, codo doblado y antebrazo apoyado delante del pecho -->
          <path fill="#ae151b" d="M256 249 C279 254 291 291 298 333 C303 352 301 366 289 372 C274 380 261 369 242 360 L155 326 C141 319 144 301 157 296 C170 290 186 299 206 309 L270 338 C267 317 258 294 245 280Z"/>
          <path fill="#d02625" stroke="none" d="M269 279 C278 293 284 312 287 344 Q282 349 271 343 L209 318 Q240 327 265 340Z"/>
          <path fill="#efb286" d="M154 297 C139 291 129 299 130 309 C132 320 149 327 162 329 L173 313Z"/>
          <!-- Brazo izquierdo por encima: codo curvo, manga con volumen, puño visible -->
          <path fill="#c71b20" d="M129 248 C102 258 85 307 87 349 C88 372 105 380 120 370 C134 361 143 354 158 348 L250 317 C263 312 258 294 245 288 C232 284 221 291 210 295 L120 334 C118 317 128 292 142 275Z"/>
          <path fill="#e1362b" stroke="none" d="M111 274 Q97 308 100 349 Q107 354 116 345 L210 313 Q162 329 118 351 Q111 321 125 283Z"/>
          <path fill="#efb286" d="M247 290 C261 286 276 293 278 307 C281 318 269 324 251 324 L237 302Z"/>
          <path stroke="#722327" fill="none" stroke-width="2" d="M113 344 Q124 352 134 351 M260 336 Q276 348 289 350"/>
        </g>`
    },
    roger: {
      viewBox: '0 0 822 1493',
      // Sobre la ilustracion original completa se reconstruye el abrigo/capa
      // bajo los brazos. Las mangas tienen volumen, codos, punos y manos.
      // Se evita la base recortada (roger-body.png): dejaba huecos azul oscuro.
      artwork: `
        <g stroke-linejoin="round" stroke-linecap="round">
          <!-- Reconstruccion de la capa debajo de los brazos originales. -->
          <path fill="#a7191c" d="M182 604 Q154 615 137 687 L130 830 Q133 891 170 906 Q205 912 231 869 L267 635 Q242 629 213 612Z"/>
          <path fill="#a7191c" d="M608 606 Q656 601 680 670 L710 833 Q717 900 677 913 Q651 909 627 877 L567 631Z"/>
          <!-- Brazo derecho: manga rosa doblada, de hombro a codo. -->
          <g stroke="#332631" stroke-width="5">
            <path fill="#df7f9d" d="M493 434 C541 434 562 474 580 546 Q594 592 572 614 Q557 624 533 607 L348 556 Q328 550 334 529 Q339 510 355 516 L542 566 Q532 500 490 465Z"/>
            <path fill="none" stroke="#f7adc1" stroke-width="12" d="M494 457 Q533 485 543 559"/>
            <path fill="#f4b08d" d="M356 512 Q341 502 332 515 Q319 529 336 549 L362 553 Q376 542 362 528Z"/>
            <!-- Brazo izquierdo delante, por encima del derecho. -->
            <path fill="#e58ca4" d="M327 432 C288 430 266 483 250 544 L241 578 Q237 611 260 621 C271 631 285 624 308 614 L515 561 Q533 555 527 535 Q521 517 503 524 L291 582 Q305 493 345 461Z"/>
            <path fill="none" stroke="#f4b5c6" stroke-width="12" d="M310 455 Q279 493 274 582 Q277 603 300 588"/>
            <path fill="#f4b08d" d="M509 521 Q526 517 540 531 Q547 543 534 560 L508 565 Q493 547 509 521Z"/>
            <path fill="none" stroke="#ad5975" stroke-width="4" d="M291 580 L303 605 M545 564 L565 578"/>
          </g>
        </g>`
    }
  };
  function layer(path, part) {
    const img = U.make('img', 'thinking-part thinking-' + part);
    img.src = `assets/${path}-${part}.png`;
    img.alt = '';
    img.draggable = false;
    return img;
  }
  function mount(host, character) {
    host.querySelector('.thinking-rig')?.remove();
    const kind = poses[character] ? character : 'luffy';
    const wrap = U.make('span', 'thinking-rig');
    wrap.dataset.character = kind;
    if (kind === 'roger') {
      // La ilustracion ENTERA conserva la capa, las hombreras y el torso.
      // Las mangas cruzadas y la reconstruccion de la capa se dibujan encima.
      const full = U.make('img', 'thinking-part thinking-full');
      full.src = 'assets/roger.png';
      full.alt = '';
      full.draggable = false;
      wrap.append(full);
    } else {
      wrap.append(layer(kind, 'leg-left'), layer(kind, 'leg-right'), layer(kind, 'body'));
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('thinking-crossed-svg');
    svg.setAttribute('viewBox', poses[kind].viewBox);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = poses[kind].artwork;
    wrap.append(svg);
    host.append(wrap);
    return wrap;
  }
  function setCharacter(character) {
    mount(U.byId('player-sprite-wrap'), character);
    mount(U.byId('companion-frame'), character);
  }
  function init() { setCharacter('luffy'); }
  OP.poses = { init, setCharacter, mount };
})();
