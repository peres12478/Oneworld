/* Mundo de exploración cenital: TODAS las frutas recibidas de la API REST se dibujan. */
(function () {
  'use strict';
  const OP=window.OP,U=OP.util,C=OP.config;
  const nodes=new Map();
  let all=[];
  function category(fruit){const t=U.normalize(fruit.type);return t.includes('logia')?'type-logia':t.includes('zoan')?'type-zoan':'type-paramecia';}
  function createFruit(fruit,x,y){
    const el=U.make('button','world-fruit '+category(fruit));el.type='button';
    el.style.left=x+'px';el.style.top=y+'px';el.title=fruit.name;
    el.setAttribute('aria-label','Inspeccionar '+fruit.name);
    const halo=U.make('span','fruit-halo');
    const orb=U.make('span','fruit-orb');
    const picture=U.make('span','fruit-picture');
    OP.media.mount(picture,fruit,'fruit-remote-image');
    const kind=U.make('span','fruit-element-symbol',U.normalize(fruit.type).includes('logia')?'L':U.normalize(fruit.type).includes('zoan')?'Z':'P');
    orb.append(picture,kind);
    el.append(halo,orb,U.make('span','fruit-label',fruit.name));
    el.addEventListener('click',()=>OP.ui.openDetail(fruit));
    nodes.set(fruit.id,{fruit,x,y,element:el});return el;
  }
  function setFruits(fruits){
    all=fruits.slice();nodes.clear();
    const layer=U.byId('fruit-layer');layer.replaceChildren();
    const cols=14, rows=Math.max(9,Math.ceil(all.length/cols));
    C.worldHeight=Math.max(3300,rows*246+320);
    U.byId('world').style.width=C.worldWidth+'px';
    U.byId('world').style.height=C.worldHeight+'px';
    const marginX=190, marginY=190;
    const cellX=(C.worldWidth-marginX*2)/cols;
    const cellY=(C.worldHeight-marginY*2)/rows;
    const entries=all.map((fruit,i)=>{
      const c=i%cols,r=Math.floor(i/cols);
      return {fruit, x:marginX+c*cellX+cellX*.5+(r%2?23:-23),y:marginY+r*cellY+cellY*.5};
    });
    const fragment=document.createDocumentFragment();
    for(const p of entries)fragment.append(createFruit(p.fruit,p.x,p.y));
    layer.append(fragment);
  }
  function findNearest(x,y,radius=162){
    let nearest=null,d2=radius*radius;
    for(const {fruit,x:px,y:py} of nodes.values()){
      const d=(x-px)**2+(y-py)**2;
      if(d<d2){nearest=fruit;d2=d;}
    }
    return nearest;
  }
  function focusFruit(fruit){return nodes.get(fruit.id) || null;}
  function init(){
    const islandLayer=U.byId('island-layer');
    [
      [380,420,300,'SHELLS TOWN','EAST BLUE'],
      [3000,350,330,'SKY ISLAND','PARAÍSO'],
      [320,2500,335,'ARLONG PARK','EAST BLUE'],
      [3130,2500,370,'DRESSROSA','NEW WORLD'],
      [1870,2990,340,'WATER SEVEN','GRAND LINE'],
      [1800,250,315,'LOGUETOWN','PUERTO PIRATA']
    ].forEach(([x,y,w,note,sub])=>{
      const el=U.make('div','map-island');el.style.left=x+'px';el.style.top=y+'px';el.style.width=w+'px';el.style.height=w*.54+'px';
      el.append(U.make('span','island-palm','♧'),U.make('div','island-name',note),U.make('div','island-subname',sub));
      islandLayer.append(el);
    });
  }
  OP.world={init,setFruits,findNearest,focusFruit,getAll:()=>all.slice()};
})();
