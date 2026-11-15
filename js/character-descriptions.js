/*
 * Descripciones editoriales para los personajes asociados a las 24 islas.
 * Son textos breves ORIGINALES del proyecto: no proceden de la API.
 * Las fichas verificables (nombre, origen, afiliación, etc.) siguen llegando
 * exclusivamente de la API de personajes.
 *
 * Para personajes nuevos o sin una biografía editorial, se genera un resumen
 * limitado a los hechos que devuelve la API, sin añadir datos inventados.
 */
(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  const bios = {
    'Absalom': 'Miembro de los Piratas de Thriller Bark y subordinado de Gecko Moria. Usa su habilidad de invisibilidad para actuar desde las sombras.',
    'Aisa': 'Niña shandia de Skypiea que posee un Mantra especialmente sensible. Su valor ayuda a enfrentar los peligros de la isla del cielo.',
    'Arlong': 'Pirata gyojin y capitán de los Piratas de Arlong. Estableció su dominio en las islas Conomi, donde mantuvo sometidos a sus habitantes.',
    'Atlas': 'Uno de los satélites del doctor Vegapunk. En Egghead representa una faceta de su personalidad y participa en sus experimentos tecnológicos.',
    'Bartholomew Kuma': 'Antiguo miembro del Ejército Revolucionario y exintegrante de los Siete Guerreros del Mar. Su historia está estrechamente relacionada con Bonney y Egghead.',
    'Bartolomeo': 'Capitán de los Piratas de Barto y gran admirador de Luffy. Su habilidad le permite crear barreras prácticamente impenetrables.',
    'Bentham': 'Conocido como Bon Clay, es un antiguo agente de Baroque Works. Su lealtad a sus amigos lo convirtió en un aliado inolvidable.',
    'Blueno': 'Agente de CP9 capaz de crear puertas sobre distintas superficies gracias a su fruta. Se enfrenta a los Sombrero de Paja durante los sucesos de Water 7 y Enies Lobby.',
    'Boa Hancock': 'Emperatriz de Amazon Lily y capitana de las Piratas Kuja. Es una guerrera formidable y antigua integrante de los Siete Guerreros del Mar.',
    'Boa Marigold': 'Una de las hermanas de Boa Hancock y guerrera de las Kuja. Protege Amazon Lily junto a su familia y sus compañeras.',
    'Boa Sandersonia': 'Hermana de Boa Hancock y combatiente de las Piratas Kuja. Destaca por su fuerza y por sus habilidades de combate.',
    'Borsalino': 'Almirante de la Marina conocido como Kizaru. Utiliza una fruta de tipo Logia que le permite controlar y transformarse en luz.',
    'Brogy': 'Guerrero gigante de Elbaf y antiguo capitán de los Piratas Guerreros Gigantes. Mantiene una rivalidad legendaria con Dorry.',
    'Brook': 'Músico de los Piratas del Sombrero de Paja y espadachín esquelético. La Yomi Yomi no Mi le permitió regresar a la vida.',
    'Buggy': 'Pirata de aspecto circense que fue aprendiz en la tripulación de Roger. Sus aventuras lo llevaron a convertirse en una figura importante del mundo pirata.',
    'Cabaji': 'Espadachín acrobático de los Piratas de Buggy. Combina técnicas de espada con movimientos de circo para sorprender a sus rivales.',
    'Caesar Clown': 'Científico especializado en gases y armas químicas. Realizó experimentos peligrosos en Punk Hazard usando sus conocimientos y poderes.',
    'Camie': 'Sirena originaria del mundo submarino que entabla amistad con los Sombrero de Paja. Su historia está ligada al archipiélago Sabaody.',
    'Carrot': 'Joven mink de la tribu de los conejos. Sueña con conocer el mundo y demuestra un gran valor al acompañar a sus aliados.',
    'Chaka': 'Guardián real de Alabasta y usuario de una fruta Zoan. Sirve con lealtad a la familia Nefertari.',
    'Charlotte Cracker': 'Uno de los comandantes dulces de los Piratas de Big Mom. Puede crear y controlar galletas endurecidas para combatir.',
    'Charlotte Katakuri': 'Comandante dulce de los Piratas de Big Mom y uno de sus luchadores más poderosos. Es conocido por su dominio del Haki de observación.',
    'Charlotte Linlin': 'Conocida como Big Mom, fue una de los Cuatro Emperadores. Gobernó Totto Land y formó una enorme familia de piratas.',
    'Charlotte Perospero': 'Hijo mayor de Big Mom y miembro destacado de su tripulación. Utiliza el poder del caramelo en combate.',
    'Charlotte Pudding': 'Integrante de la familia Charlotte y miembro de la tribu de los tres ojos. Su historia se relaciona con Sanji y Whole Cake Island.',
    'Charlotte Smoothie': 'Comandante dulce de los Piratas de Big Mom. Es una poderosa espadachina con una habilidad capaz de extraer líquidos.',
    'Clover': 'Profesor y arqueólogo de Ohara que dedicó su vida al estudio de la historia antigua. Dirigió a los eruditos de la isla.',
    'Conis': 'Habitante de Skypiea que ayuda a Luffy y sus compañeros durante su aventura en el cielo. Su bondad contrasta con los peligros del lugar.',
    'Crocodile': 'Antiguo miembro de los Siete Guerreros del Mar y líder de Baroque Works. Su plan puso en peligro al reino de Alabasta.',
    'Diamante': 'Uno de los principales oficiales de la familia Donquixote. Fue una figura destacada del Coliseo Corrida en Dressrosa.',
    'Don Krieg': 'Capitán de una gran flota pirata del East Blue. Su ambición y armamento lo llevaron a enfrentarse a los cocineros del Baratie.',
    'Donquixote Doflamingo': 'Antiguo rey de Dressrosa y capitán de los Piratas Donquixote. Gobernó el reino mediante el miedo y el poder de sus hilos.',
    'Dorry': 'Guerrero gigante de Elbaf y antiguo capitán de los Piratas Guerreros Gigantes. Su duelo con Brogy se convirtió en una leyenda.',
    'Edward Newgate': 'Conocido como Barbablanca, fue uno de los Cuatro Emperadores y capitán de los Piratas de Barbablanca. Consideraba a su tripulación una familia.',
    'Enel': 'Antiguo gobernante de Skypiea que se proclamó dios. Controla el rayo gracias a una poderosa fruta de tipo Logia.',
    'Franky': 'Cyborg y carpintero naval de los Piratas del Sombrero de Paja. Sus conocimientos de ingeniería nacieron en Water 7.',
    'Fukaboshi': 'Príncipe del Reino Ryugu e hijo del rey Neptune. Defiende la convivencia entre humanos y gyojin.',
    'Fukurou': 'Agente de CP9 con técnicas de combate del Rokushiki. Participa en los enfrentamientos de Enies Lobby.',
    'Gan Fall': 'Antiguo dios de Skypiea y experimentado guerrero del cielo. Ayuda a recuperar la paz en las islas celestes.',
    'Gecko Moria': 'Capitán de los Piratas de Thriller Bark y antiguo Guerrero del Mar. Manipula sombras para dar vida a su ejército de zombis.',
    'Genzo': 'Habitante y antiguo policía de Villa Cocoyasi. Actúa como protector de Nami y Nojiko durante la ocupación de Arlong.',
    'Gin': 'Combatiente de la tripulación de Don Krieg. Su encuentro con Sanji en el Baratie pone a prueba su lealtad.',
    'Gol D. Roger': 'Conocido como el Rey de los Piratas, lideró la tripulación que llegó a Laugh Tale. Su legado dio comienzo a la Gran Era de la Piratería.',
    'Hajrudin': 'Guerrero gigante de Elbaf y capitán de los Nuevos Piratas Guerreros Gigantes. Busca devolver prestigio a los guerreros de su pueblo.',
    'Hannyabal': 'Funcionario de Impel Down que aspira a dirigir la prisión. Pese a su carácter cómico, toma muy en serio su deber.',
    'Hatchan': 'Gyojin de seis brazos que formó parte de los Piratas de Arlong. Más tarde desarrolla una amistad con los Sombrero de Paja.',
    'Hody Jones': 'Pirata gyojin y líder de los Nuevos Piratas Gyojin. Sus ideas extremistas amenazan la paz de la Isla Gyojin.',
    'Hogback': 'Médico que trabaja para Gecko Moria en Thriller Bark. Colabora en la creación y mantenimiento de los zombis.',
    'Iceburg': 'Alcalde de Water 7 y presidente de la Galley-La Company. Es un carpintero naval de enorme prestigio.',
    'Inuarashi': 'Duque de Mokomo y uno de los líderes de los minks de Zou. Comparte la defensa de su pueblo con Nekomamushi.',
    'Jack': 'Una de las tres Calamidades de los Piratas de las Bestias. Su brutalidad lo convierte en una amenaza para Zou y Wano.',
    'Jaguar D. Saul': 'Gigante y antiguo vicealmirante de la Marina que desarrolla una amistad con Nico Robin. Su historia está unida a la tragedia de Ohara.',
    'Jango': 'Hipnotizador y antiguo subordinado de Kuro. Más adelante se incorpora a la Marina.',
    'Jarul': 'Anciano guerrero gigante de Elbaf y una figura respetada por su comunidad. Conserva el recuerdo de antiguas tradiciones.',
    'Jewelry Bonney': 'Pirata de la Peor Generación conocida como la Glotona. Su vínculo con Bartholomew Kuma es fundamental en los sucesos de Egghead.',
    'Jinbe': 'Gyojin tiburón ballena, experto en karate gyojin y timonel de los Piratas del Sombrero de Paja. Defiende la igualdad entre pueblos.',
    'Kaido': 'Conocido como la criatura más fuerte, fue uno de los Cuatro Emperadores y jefe de los Piratas de las Bestias. Dominó Wano junto a Orochi.',
    'Kaku': 'Agente del Gobierno Mundial y experto en Rokushiki. Trabajó encubierto como carpintero naval en Water 7.',
    'Kalifa': 'Agente de CP9 que se infiltró en la oficina de Iceburg. Participó en la operación contra los Sombrero de Paja.',
    'Kaya': 'Joven de Villa Syrup y gran amiga de Usopp. Sueña con convertirse en médica para ayudar a los demás.',
    'Kinemon': 'Samurái de Wano y fiel servidor de la familia Kozuki. Lidera los esfuerzos por devolver la libertad a su país.',
    'King': 'Alberga el título de Calamidad dentro de los Piratas de las Bestias. Es uno de los subordinados más poderosos de Kaido.',
    'Kozuki Momonosuke': 'Heredero del clan Kozuki y figura clave para el futuro de Wano. Su viaje lo lleva a luchar por la liberación de su tierra.',
    'Kozuki Oden': 'Legendario samurái de Wano que navegó con grandes tripulaciones piratas. Su voluntad inspiró a quienes buscaron liberar el país.',
    'Kuro': 'Antiguo capitán de los Piratas del Gato Negro. Intentó llevar una vida encubierta en Villa Syrup para ejecutar sus planes.',
    'Kurozumi Orochi': 'Gobernante de Wano que mantuvo el poder con el apoyo de Kaido. Su régimen provocó sufrimiento entre sus habitantes.',
    'Kuzan': 'Antiguo almirante de la Marina conocido como Aokiji. Sus poderes de hielo lo convierten en uno de los combatientes más temibles.',
    'Kyros': 'Legendario gladiador del Coliseo Corrida y protector de Rebecca. Su lucha está ligada a la liberación de Dressrosa.',
    'Lilith': 'Una de las satélites del doctor Vegapunk. Representa una faceta de su personalidad y participa en los inventos de Egghead.',
    'Loki': 'Príncipe gigante de Elbaf vinculado a la familia real del país. Su figura tiene un papel importante en los asuntos de los gigantes.',
    'Magellan': 'Antiguo director de Impel Down y usuario de una fruta venenosa. Su poder lo hace uno de los guardianes más peligrosos de la prisión.',
    'Makino': 'Amable dueña de un bar de Villa Foosha. Es una persona cercana a Luffy desde su infancia.',
    'Marguerite': 'Guerrera de las Kuja de Amazon Lily. Se hace amiga de Luffy cuando este llega al reino.',
    'Mohji': 'Domador de fieras y oficial de los Piratas de Buggy. Combate habitualmente junto a su león Richie.',
    'Monet': 'Subordinada de Donquixote Doflamingo que trabaja en Punk Hazard. Su fruta le permite controlar la nieve.',
    'Monkey D. Dragon': 'Líder del Ejército Revolucionario y padre de Luffy. Es una figura central en la oposición al Gobierno Mundial.',
    'Monkey D. Garp': 'Legendario vicealmirante de la Marina, conocido como el Héroe de la Marina. Es abuelo de Luffy.',
    'Monkey D. Luffy': 'Capitán de los Piratas del Sombrero de Paja. Sueña con encontrar el One Piece y convertirse en el Rey de los Piratas.',
    'Nami': 'Navegante de los Piratas del Sombrero de Paja y experta en meteorología. Su sueño es dibujar un mapa del mundo entero.',
    'Nefertari Cobra': 'Rey de Alabasta y padre de Vivi. Se preocupa profundamente por el bienestar de su pueblo.',
    'Nefertari Vivi': 'Princesa de Alabasta y gran amiga de los Sombrero de Paja. Trabaja para proteger la paz de su reino.',
    'Nekomamushi': 'Uno de los gobernantes de Mokomo y guerrero mink de Zou. Defiende a su pueblo junto a Inuarashi.',
    'Neptune': 'Rey del Reino Ryugu y padre de Shirahoshi. Gobierna la Isla Gyojin y busca un futuro de convivencia.',
    'Nico Olvia': 'Arqueóloga de Ohara y madre de Nico Robin. Dedicó su vida a investigar los misterios del Siglo Vacío.',
    'Nico Robin': 'Arqueóloga de los Piratas del Sombrero de Paja y superviviente de Ohara. Busca descubrir la verdadera historia del mundo.',
    'Nojiko': 'Hermana adoptiva de Nami y habitante de las islas Conomi. Comparte con ella una historia marcada por Arlong.',
    'Paulie': 'Carpintero naval de la Galley-La Company en Water 7. Utiliza cuerdas como herramientas de combate.',
    'Pedro': 'Guerrero mink y antiguo capitán de los Piratas Nox. Lucha por el futuro de su pueblo y sus aliados.',
    'Pell': 'Guardián real de Alabasta con habilidades de halcón. Se enfrenta al peligro para proteger a la familia Nefertari.',
    'Perona': 'Antigua integrante de los Piratas de Thriller Bark. Su fruta le permite crear fantasmas que afectan el ánimo de los demás.',
    'Pica': 'Oficial de la familia Donquixote con la capacidad de fusionarse con la piedra. Defiende el régimen de Doflamingo en Dressrosa.',
    'Queen': 'Una de las Calamidades de los Piratas de las Bestias. Combina inventos científicos, modificaciones corporales y gran fuerza.',
    'Rebecca': 'Gladiadora de Dressrosa y nieta del rey Riku. Su historia refleja el sufrimiento del reino bajo el poder de Doflamingo.',
    'Riku Doldo III': 'Antiguo rey de Dressrosa, respetado por su carácter pacífico. Su familia fue víctima de la conspiración de Doflamingo.',
    'Rob Lucci': 'Agente del Gobierno Mundial y hábil usuario del Rokushiki. Es uno de los principales adversarios en Enies Lobby.',
    'Sakazuki': 'Conocido como Akainu, es un alto mando de la Marina. Defiende una idea inflexible de la justicia y domina el magma.',
    'Saldeath': 'Funcionario de Impel Down responsable de dirigir a varios guardias de la prisión.',
    'Sanji': 'Cocinero de los Piratas del Sombrero de Paja y experto en combate con las piernas. Aprendió el oficio en el Baratie junto a Zeff.',
    'Sengoku': 'Antiguo almirante de flota de la Marina. Participó en decisiones cruciales durante la guerra de Marineford.',
    'Sentomaru': 'Combatiente y guardaespaldas vinculado al doctor Vegapunk. Se encarga de tareas de seguridad relacionadas con Egghead.',
    'Shakuyaku': 'Conocida como Shakky, dirige un bar en Sabaody. Mantiene contactos con numerosas figuras del mundo pirata.',
    'Shanks': 'Capitán de los Piratas del Pelirrojo y uno de los grandes piratas del mundo. Inspiró a Luffy a perseguir su sueño.',
    'Shirahoshi': 'Princesa sirena del Reino Ryugu. Su naturaleza especial la convierte en una figura muy importante para el mundo.',
    'Shiryu': 'Antiguo carcelero de Impel Down y temible espadachín. Su trayectoria lo lleva a unirse a una poderosa tripulación pirata.',
    'Silvers Rayleigh': 'Antiguo primer oficial de los Piratas de Roger, conocido como el Rey Oscuro. Se convierte en mentor de Luffy durante su entrenamiento.',
    'Smiley': 'Criatura de gas venenoso creada por Caesar Clown en Punk Hazard. Representa el peligro de sus experimentos.',
    'Smoker': 'Oficial de la Marina que persigue a Luffy desde Loguetown. Puede transformarse en humo gracias a una fruta Logia.',
    'Spandam': 'Funcionario del Gobierno Mundial que lideró CP9 durante el incidente de Enies Lobby. Busca el poder mediante su posición.',
    'Stussy': 'Agente relacionada con los secretos del Gobierno Mundial y la ciencia de Egghead. Tiene vínculos con la historia de Vegapunk.',
    'Sugar': 'Miembro de la familia Donquixote cuya fruta transforma personas en juguetes. Su habilidad fue fundamental para el control de Dressrosa.',
    'Tashigi': 'Espadachina de la Marina y subordinada de Smoker. Busca recuperar espadas famosas que están en manos de criminales.',
    'Trebol': 'Alto oficial de la familia Donquixote y uno de los colaboradores más cercanos a Doflamingo.',
    'Usopp': 'Francotirador de los Piratas del Sombrero de Paja y gran narrador de historias. Sueña con convertirse en un valiente guerrero del mar.',
    'Vander Decken IX': 'Pirata gyojin obsesionado con Shirahoshi. Su fruta le permite hacer que objetos lanzados persigan a objetivos marcados.',
    'Vegapunk': 'Científico de extraordinaria inteligencia dedicado a investigar tecnologías revolucionarias. Su isla Egghead reúne sus experimentos más avanzados.',
    'Vergo': 'Oficial de la Marina infiltrado al servicio de Doflamingo. Su papel es decisivo en los sucesos de Punk Hazard.',
    'Wanda': 'Guerrera mink de Zou que pertenece a los guardianes del bosque. Ayuda a proteger su hogar y sus aliados.',
    'Woop Slap': 'Alcalde de Villa Foosha que conoce a Luffy desde pequeño. Observa con preocupación sus aventuras como pirata.',
    'Wyper': 'Guerrero shandia que lucha por recuperar la tierra de sus antepasados en Skypiea.',
    'Yamato': 'Hijo de Kaido y admirador de Kozuki Oden. Aspira a vivir con libertad y se une a la lucha por Wano.',
    'York': 'Una de las satélites del doctor Vegapunk, asociada a sus necesidades físicas. Participa en la compleja historia de Egghead.',
    'Zeff': 'Dueño y chef del restaurante Baratie, antiguo pirata y mentor de Sanji. Enseña la importancia de alimentar a quien tenga hambre.'
  };
  function normalized(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
      .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  }
  const keyed = new Map(Object.entries(bios).map(([name,description])=>[normalized(name),description]));
  function meaningful(value){
    const t=String(value||'').trim();
    return t && !/^(no registrado|unknown|none|n\/a|no disponible|null)$/i.test(t)?t:'';
  }
  function fromApi(person){
    const fields = person.raw && person.raw.extra_data || {};
    for(const k of ['description','biography','bio','summary','about']){
      const s=fields[k];
      const value=typeof s==='string'?s.trim():typeof s==='object'&&s?String(s.es||s.en||'').trim():'';
      if(value.length>30){
        return {text:value.length>550?value.slice(0,547).replace(/\s+\S*$/,'')+'…':value,
          source:'Descripción proporcionada por la API'};
      }
    }
    return null;
  }
  function fallback(person){
    const parts=[];
    const role=meaningful(person.occupation), group=meaningful(person.affiliation), origin=meaningful(person.origin);
    if(role&&group) parts.push(`${person.name} desempeña el papel de ${role} y se relaciona con ${group}.`);
    else if(role)parts.push(`${person.name} aparece registrado como ${role}.`);
    else if(group)parts.push(`${person.name} está vinculado con ${group}.`);
    if(origin) parts.push(`Su origen se registra como ${origin}.`);
    if(!parts.length){
      return {text:`${person.name} es un personaje del universo de One Piece. Esta ficha reúne los datos disponibles en el catálogo de personajes.`,
        source:'Resumen básico de la ficha'};
    }
    return {text:parts.join(' '),source:'Resumen basado en los datos de la API'};
  }
  function get(person){
    // Primero usar la descripción que de verdad venga de la API, si existe.
    const remote=fromApi(person);
    if(remote)return remote;
    const options=[person.name,...(person.altNames||[])].map(normalized);
    const custom=options.map(key=>keyed.get(key)).find(Boolean);
    if(custom)return {text:custom,source:'Reseña editorial del juego'};
    return fallback(person);
  }
  OP.characterDescriptions={get,normalized,count:keyed.size};
})();
