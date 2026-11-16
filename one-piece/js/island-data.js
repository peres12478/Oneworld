/*
 * Mapa editorial de islas y personajes ASOCIADOS al lugar.
 * IMPORTANTE: esta relación es curaduría local de la experiencia,
 * NO un campo que afirmemos que existe en la API.
 * Las fichas personales, imágenes y recompensas se consultan a la API REST.
 */
(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  const I = (id, name, sea, theme, landscape, subtitle, people, aliases=[]) =>
    ({ id, name, sea, theme, landscape, subtitle, people, aliases });
  OP.islandData = [
    I('foosha','Villa Foosha','East Blue','emerald','village','Donde comienza el sueño de un pirata',
      ['Monkey D. Luffy','Shanks','Makino','Woop Slap'],['Foosha Village','Windmill Village']),
    I('orange','Orange Town','East Blue','sunset','village','Una ciudad costera en tiempos de piratas',
      ['Buggy','Nami','Cabaji','Mohji'],['Orange Town']),
    I('syrup','Villa Syrup','East Blue','green','village','Colinas, mansiones y grandes historias',
      ['Usopp','Kaya','Kuro','Jango'],['Syrup Village']),
    I('baratie','Baratie','East Blue','gold','harbor','El restaurante flotante sobre el mar',
      ['Sanji','Zeff','Don Krieg','Gin'],['Baratie']),
    I('arlong','Arlong Park','East Blue','coral','harbor','La base del dominio de Arlong',
      ['Arlong','Nami','Nojiko','Hatchan','Genzo'],['Conomi Islands','Cocoyasi Village']),
    I('loguetown','Loguetown','East Blue','slate','city','La ciudad del comienzo y el fin',
      ['Smoker','Tashigi','Gol D. Roger','Monkey D. Dragon'],['Loguetown']),
    I('alabasta','Alabasta','Paradise','sand','pyramid','El reino del desierto y sus secretos',
      ['Nefertari Vivi','Nefertari Cobra','Crocodile','Pell','Chaka','Nico Robin'],['Arabasta','Alubarna']),
    I('skypiea','Skypiea','Cielo','sky','cloud','La isla suspendida entre las nubes',
      ['Enel','Gan Fall','Wyper','Conis','Aisa'],['Sky Island','Skypiea']),
    I('water7','Water 7','Paradise','azure','canal','La metrópolis de los carpinteros navales',
      ['Franky','Iceburg','Paulie','Kaku','Rob Lucci'],['Water Seven']),
    I('enies','Enies Lobby','Paradise','ivory','justice','La isla judicial del Gobierno Mundial',
      ['Spandam','Rob Lucci','Kaku','Kalifa','Blueno','Fukurou'],['Enies Lobby']),
    I('thriller','Thriller Bark','Florian Triangle','violet','ghost','Una isla flotante entre sombras',
      ['Gecko Moria','Perona','Absalom','Hogback','Brook'],['Thriller Bark']),
    I('sabaody','Archipiélago Sabaody','Paradise','teal','grove','Burbujas brillantes y raíces gigantes',
      ['Silvers Rayleigh','Shakuyaku','Camie','Hatchan','Jewelry Bonney'],['Sabaody Archipelago']),
    I('amazon','Amazon Lily','Calm Belt','rose','jungle','El reino protegido de las Kuja',
      ['Boa Hancock','Boa Sandersonia','Boa Marigold','Marguerite'],['Amazon Lily']),
    I('impel','Impel Down','Calm Belt','steel','prison','La prisión bajo las profundidades',
      ['Magellan','Hannyabal','Shiryu','Bentham','Saldeath'],['Impel Down']),
    I('marineford','Marineford','Paradise','navy','fortress','El escenario de una guerra legendaria',
      ['Sengoku','Sakazuki','Borsalino','Monkey D. Garp','Kuzan','Edward Newgate'],['Marineford']),
    I('fishman','Isla Gyojin','Nuevo Mundo','ocean','underwater','Un reino de coral bajo el océano',
      ['Shirahoshi','Neptune','Jinbe','Hody Jones','Vander Decken IX','Fukaboshi'],['Fish-Man Island','Fishman Island','Ryugu Kingdom']),
    I('punk','Punk Hazard','Nuevo Mundo','ember','split','El encuentro entre fuego y hielo',
      ['Caesar Clown','Monet','Vergo','Smiley'],['Punk Hazard']),
    I('dressrosa','Dressrosa','Nuevo Mundo','rose','coliseum','El reino de las flores y los juguetes',
      ['Donquixote Doflamingo','Rebecca','Riku Doldo III','Kyros','Trebol','Pica','Diamante','Sugar','Bartolomeo'],['Dressrosa']),
    I('zou','Zou','Nuevo Mundo','forest','elephant','Una civilización sobre un elefante milenario',
      ['Inuarashi','Nekomamushi','Carrot','Wanda','Pedro'],['Zou','Mokomo Dukedom']),
    I('wholecake','Whole Cake Island','Nuevo Mundo','candy','cake','Castillos de azúcar en Totto Land',
      ['Charlotte Linlin','Charlotte Katakuri','Charlotte Pudding','Charlotte Perospero','Charlotte Cracker','Charlotte Smoothie'],['Totto Land','Whole Cake Island']),
    I('wano','País de Wano','Nuevo Mundo','sakura','torii','Cerezos, samuráis y castillos antiguos',
      ['Kaido','Kozuki Momonosuke','Kozuki Oden','Yamato','King','Queen','Jack','Kurozumi Orochi','Kinemon'],['Wano Country','Wano Kuni']),
    I('egghead','Egghead','Nuevo Mundo','cyber','lab','La isla de la ciencia del futuro',
      ['Vegapunk','Sentomaru','Jewelry Bonney','Bartholomew Kuma','Stussy','Lilith','Atlas','York'],['Egghead Island','Future Island']),
    I('elbaf','Elbaf','Nuevo Mundo','nordic','tree','El inmenso territorio de los gigantes',
      ['Dorry','Brogy','Hajrudin','Loki','Jarul'],['Elbaph','Warland']),
    I('ohara','Ohara','West Blue','forest','library','La isla de los eruditos y la memoria',
      ['Nico Robin','Nico Olvia','Clover','Jaguar D. Saul'],['Ohara'])
  ];
})();
