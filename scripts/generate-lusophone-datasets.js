#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reviewed = '2026-10-10';
const sources = {
  portugal: [
    ['portugal-parliament', 'Assembleia da República', 'História do Parlamentarismo Português', 'institutional', 'https://www.parlamento.pt/Parlamento/Paginas/Historia-Parlamentarismo.aspx'],
    ['antt', 'Arquivo Nacional da Torre do Tombo', 'Coleções e documentos da história portuguesa', 'archive', 'https://antt.dglab.gov.pt/'],
  ],
  empire: [
    ['unesco-slave-route', 'UNESCO', 'Routes of Enslaved Peoples', 'institutional', 'https://www.unesco.org/en/routes-enslaved-peoples'],
    ['unesco-africa', 'UNESCO', 'General History of Africa', 'academic', 'https://www.unesco.org/en/general-history-africa'],
  ],
  africa: [
    ['unesco-africa', 'UNESCO', 'General History of Africa', 'academic', 'https://www.unesco.org/en/general-history-africa'],
    ['un-decolonization', 'United Nations', 'The United Nations and Decolonization', 'institutional', 'https://www.un.org/dppa/decolonization/en'],
  ],
  timor: [
    ['un-timor', 'United Nations', 'United Nations in Timor-Leste', 'institutional', 'https://timorleste.un.org/en'],
    ['timor-memory', 'UNESCO', 'On the Birth of a Nation: Turning points', 'archive', 'https://en.unesco.org/memoryoftheworld/registry/313'],
  ],
};

const topics = [
  ['portugal-formacao-medieval','Formação medieval de Portugal','Medieval formation of Portugal','Formación medieval de Portugal','Europe','portugal',[
    [-868,'Condado Portucalense','County of Portugal','Condado Portucalense','political'],[1096,'Condado de Henrique de Borgonha','County of Henry of Burgundy','Condado de Enrique de Borgoña','political'],[1128,'Batalha de São Mamede','Battle of São Mamede','Batalla de São Mamede','war'],[1139,'Afonso Henriques assume o título de rei','Afonso Henriques assumes the title of king','Afonso Henriques asume el título de rey','political'],[1143,'Tratado de Zamora','Treaty of Zamora','Tratado de Zamora','political'],[1147,'Conquista de Lisboa','Conquest of Lisbon','Conquista de Lisboa','war'],[1179,'Bula Manifestis Probatum','Manifestis Probatum bull','Bula Manifestis Probatum','religious'],[1249,'Conquista do Algarve','Conquest of the Algarve','Conquista del Algarve','war'],[1297,'Tratado de Alcanizes','Treaty of Alcañices','Tratado de Alcañices','political']]],
  ['portugal-expansao-estado-india','Expansão marítima e Estado da Índia','Maritime expansion and the Estado da Índia','Expansión marítima y Estado de la India','Global','empire',[
    [1415,'Conquista de Ceuta','Conquest of Ceuta','Conquista de Ceuta','war'],[1434,'Gil Eanes dobra o cabo Bojador','Gil Eanes rounds Cape Bojador','Gil Eanes dobla el cabo Bojador','technological'],[1488,'Bartolomeu Dias alcança o cabo da Boa Esperança','Bartolomeu Dias reaches the Cape of Good Hope','Bartolomeu Dias llega al cabo de Buena Esperanza','technological'],[1494,'Tratado de Tordesilhas','Treaty of Tordesillas','Tratado de Tordesillas','political'],[1498,'Vasco da Gama chega à Índia','Vasco da Gama reaches India','Vasco da Gama llega a India','economic'],[1500,'Chegada da armada de Cabral ao Brasil','Cabral fleet reaches Brazil','Llegada de la armada de Cabral a Brasil','political'],[1505,'Criação do Estado da Índia','Creation of the Estado da Índia','Creación del Estado de la India','political'],[1510,'Conquista de Goa','Conquest of Goa','Conquista de Goa','war'],[1511,'Conquista de Malaca','Conquest of Malacca','Conquista de Malaca','war']]],
  ['imperio-atlantico-portugues','Império Atlântico, tráfico e escravidão','Atlantic Empire, slave trade and slavery','Imperio Atlántico, trata y esclavitud','Global','empire',[
    [1444,'Mercado de pessoas escravizadas em Lagos','Market of enslaved people in Lagos','Mercado de personas esclavizadas en Lagos','economic'],[1482,'Feitoria de São Jorge da Mina','São Jorge da Mina trading post','Factoría de São Jorge da Mina','economic'],[1530,'Colonização portuguesa sistemática no Brasil','Systematic Portuguese colonization in Brazil','Colonización portuguesa sistemática en Brasil','political'],[1570,'Regulamentação régia da escravização indígena','Royal regulation of Indigenous enslavement','Regulación regia de la esclavización indígena','political'],[1630,'Ocupação neerlandesa de Pernambuco','Dutch occupation of Pernambuco','Ocupación neerlandesa de Pernambuco','war'],[1695,'Destruição de Palmares','Destruction of Palmares','Destrucción de Palmares','war'],[1758,'Proibição da escravização indígena no Estado do Brasil','Ban on Indigenous enslavement in the State of Brazil','Prohibición de la esclavización indígena en el Estado de Brasil','political'],[1807,'Abolição britânica do tráfico atlântico','British abolition of the Atlantic slave trade','Abolición británica de la trata atlántica','political'],[1850,'Lei Eusébio de Queirós','Eusébio de Queirós Law','Ley Eusébio de Queirós','political']]],
  ['portugal-uniao-iberica-restauracao','União Ibérica e Restauração','Iberian Union and Restoration','Unión Ibérica y Restauración','Europe','portugal',[
    [1578,'Batalha de Alcácer Quibir','Battle of Alcácer Quibir','Batalla de Alcácer Quibir','war'],[1580,'Crise sucessória portuguesa','Portuguese succession crisis','Crisis sucesoria portuguesa','political'],[1581,'Cortes de Tomar','Cortes of Tomar','Cortes de Tomar','political'],[1588,'Armada contra a Inglaterra','Armada against England','Armada contra Inglaterra','war'],[1624,'Primeira ocupação neerlandesa de Salvador','First Dutch occupation of Salvador','Primera ocupación neerlandesa de Salvador','war'],[1637,'Revolta de Évora','Revolt of Évora','Revuelta de Évora','social'],[1640,'Restauração da Independência','Restoration of Independence','Restauración de la Independencia','political'],[1665,'Batalha de Montes Claros','Battle of Montes Claros','Batalla de Montes Claros','war'],[1668,'Tratado de Lisboa','Treaty of Lisbon','Tratado de Lisboa','political']]],
  ['portugal-reformas-pombalinas','Reformas pombalinas','Pombaline reforms','Reformas pombalinas','Europe','portugal',[
    [1750,'Sebastião José de Carvalho e Melo assume a Secretaria de Estado','Sebastião José de Carvalho e Melo becomes Secretary of State','Sebastião José de Carvalho e Melo asume la Secretaría de Estado','political'],[1755,'Terremoto de Lisboa','Lisbon earthquake','Terremoto de Lisboa','natural'],[1756,'Companhia Geral da Agricultura das Vinhas do Alto Douro','Douro Wine Company','Compañía de los Vinos del Alto Duero','economic'],[1757,'Diretório dos Índios','Directory of the Indians','Directorio de los Indios','political'],[1758,'Caso Távora','Távora affair','Caso Távora','political'],[1759,'Expulsão dos jesuítas','Expulsion of the Jesuits','Expulsión de los jesuitas','religious'],[1759,'Aulas Régias','Royal Classes','Aulas Regias','intellectual'],[1761,'Abolição da escravidão na metrópole','Abolition of slavery in metropolitan Portugal','Abolición de la esclavitud en la metrópoli','social'],[1772,'Reforma da Universidade de Coimbra','Reform of the University of Coimbra','Reforma de la Universidad de Coimbra','intellectual']]],
  ['portugal-liberalismo-republica','Liberalismo, monarquia constitucional e Primeira República','Liberalism, constitutional monarchy and First Republic','Liberalismo, monarquía constitucional y Primera República','Europe','portugal',[
    [1807,'Transferência da corte para o Rio de Janeiro','Transfer of the court to Rio de Janeiro','Traslado de la corte a Río de Janeiro','political'],[1820,'Revolução Liberal do Porto','Liberal Revolution of Porto','Revolución Liberal de Oporto','political'],[1822,'Constituição portuguesa de 1822','Portuguese Constitution of 1822','Constitución portuguesa de 1822','political'],[1828,'Início da Guerra Civil Portuguesa','Beginning of the Portuguese Civil War','Inicio de la Guerra Civil Portuguesa','war'],[1834,'Convenção de Évora-Monte','Convention of Évora-Monte','Convención de Évora-Monte','political'],[1851,'Regeneração','Regeneration','Regeneración','political'],[1890,'Ultimato britânico','British Ultimatum','Ultimátum británico','political'],[1910,'Implantação da República','Establishment of the Republic','Proclamación de la República','political'],[1926,'Golpe militar de 28 de Maio','Military coup of 28 May','Golpe militar del 28 de mayo','political']]],
  ['portugal-estado-novo-cravos','Estado Novo, Guerra Colonial e Revolução dos Cravos','Estado Novo, Colonial War and Carnation Revolution','Estado Novo, Guerra Colonial y Revolución de los Claveles','Europe','portugal',[
    [1933,'Constituição do Estado Novo','Estado Novo Constitution','Constitución del Estado Novo','political'],[1936,'Criação da Mocidade Portuguesa','Creation of the Portuguese Youth','Creación de la Juventud Portuguesa','political'],[1949,'Portugal integra a OTAN','Portugal joins NATO','Portugal ingresa en la OTAN','political'],[1961,'Início da guerra em Angola','Beginning of the war in Angola','Inicio de la guerra en Angola','war'],[1963,'Início da guerra na Guiné-Bissau','Beginning of the war in Guinea-Bissau','Inicio de la guerra en Guinea-Bisáu','war'],[1964,'Início da guerra em Moçambique','Beginning of the war in Mozambique','Inicio de la guerra en Mozambique','war'],[1968,'Marcelo Caetano substitui Salazar','Marcelo Caetano succeeds Salazar','Marcelo Caetano sustituye a Salazar','political'],[1974,'Revolução dos Cravos','Carnation Revolution','Revolución de los Claveles','political'],[1976,'Constituição democrática portuguesa','Portuguese democratic Constitution','Constitución democrática portuguesa','political']]],
  ['kongo-angola-precolonial','Reino do Congo e Angola pré-colonial','Kingdom of Kongo and precolonial Angola','Reino del Congo y Angola precolonial','Africa','africa',[
    [1390,'Formação do Reino do Congo','Formation of the Kingdom of Kongo','Formación del Reino del Congo','political'],[1483,'Contato diplomático com Portugal','Diplomatic contact with Portugal','Contacto diplomático con Portugal','political'],[1491,'Batismo de Nzinga a Nkuwu','Baptism of Nzinga a Nkuwu','Bautismo de Nzinga a Nkuwu','religious'],[1509,'Reinado de Afonso I do Congo','Reign of Afonso I of Kongo','Reinado de Afonso I del Congo','political'],[1568,'Invasão jaga e crise do Congo','Jaga invasion and Kongo crisis','Invasión jaga y crisis del Congo','war'],[1575,'Fundação portuguesa de Luanda','Portuguese foundation of Luanda','Fundación portuguesa de Luanda','political'],[1624,'Ascensão de Nzinga de Ndongo e Matamba','Rise of Nzinga of Ndongo and Matamba','Ascenso de Nzinga de Ndongo y Matamba','political'],[1665,'Batalha de Mbwila','Battle of Mbwila','Batalla de Mbwila','war'],[1671,'Queda do reino de Ndongo','Fall of the Kingdom of Ndongo','Caída del reino de Ndongo','war']]],
  ['angola-colonial-independencia','Angola colonial, independência e guerra civil','Colonial Angola, independence and civil war','Angola colonial, independencia y guerra civil','Africa','africa',[
    [1885,'Conferência de Berlim e reivindicações coloniais','Berlin Conference and colonial claims','Conferencia de Berlín y reclamaciones coloniales','political'],[1890,'Campanhas de ocupação colonial','Colonial occupation campaigns','Campañas de ocupación colonial','war'],[1956,'Fundação do MPLA','Foundation of the MPLA','Fundación del MPLA','political'],[1961,'Revoltas e início da guerra anticolonial','Revolts and beginning of the anticolonial war','Revueltas e inicio de la guerra anticolonial','war'],[1974,'Acordos de Alvor em negociação','Alvor Agreement negotiations','Negociaciones de los Acuerdos de Alvor','political'],[1975,'Independência de Angola','Independence of Angola','Independencia de Angola','political'],[1975,'Início da guerra civil angolana','Beginning of the Angolan Civil War','Inicio de la guerra civil angoleña','war'],[1991,'Acordos de Bicesse','Bicesse Accords','Acuerdos de Bicesse','political'],[2002,'Fim da guerra civil','End of the civil war','Fin de la guerra civil','political']]],
  ['mocambique-historia','Moçambique pré-colonial, colonial e independente','Precolonial, colonial and independent Mozambique','Mozambique precolonial, colonial e independiente','Africa','africa',[
    [1000,'Redes comerciais suaílis na costa','Swahili trade networks on the coast','Redes comerciales suajilis en la costa','economic'],[1450,'Consolidação do Estado de Mutapa','Consolidation of the Mutapa State','Consolidación del Estado de Mutapa','political'],[1498,'Passagem de Vasco da Gama','Passage of Vasco da Gama','Paso de Vasco da Gama','economic'],[1752,'Administração de Moçambique separada de Goa','Mozambique administration separated from Goa','Administración de Mozambique separada de Goa','political'],[1891,'Concessões a companhias majestáticas','Concessions to chartered companies','Concesiones a compañías privilegiadas','economic'],[1962,'Fundação da FRELIMO','Foundation of FRELIMO','Fundación de FRELIMO','political'],[1964,'Início da luta armada anticolonial','Beginning of armed anticolonial struggle','Inicio de la lucha armada anticolonial','war'],[1975,'Independência de Moçambique','Independence of Mozambique','Independencia de Mozambique','political'],[1992,'Acordo Geral de Paz','General Peace Agreement','Acuerdo General de Paz','political']]],
  ['africa-lusofona-cabral','Cabo Verde, Guiné-Bissau, São Tomé e Amílcar Cabral','Cape Verde, Guinea-Bissau, São Tomé and Amílcar Cabral','Cabo Verde, Guinea-Bisáu, Santo Tomé y Amílcar Cabral','Africa','africa',[
    [1460,'Início do povoamento de Cabo Verde','Beginning of Cape Verde settlement','Inicio del poblamiento de Cabo Verde','social'],[1470,'Início do povoamento de São Tomé','Beginning of São Tomé settlement','Inicio del poblamiento de Santo Tomé','social'],[1951,'Colônias passam a ser chamadas províncias ultramarinas','Colonies renamed overseas provinces','Colonias renombradas provincias ultramarinas','political'],[1956,'Fundação do PAIGC','Foundation of PAIGC','Fundación del PAIGC','political'],[1959,'Massacre de Pidjiguiti','Pidjiguiti massacre','Masacre de Pidjiguiti','social'],[1963,'Luta armada na Guiné-Bissau','Armed struggle in Guinea-Bissau','Lucha armada en Guinea-Bisáu','war'],[1973,'Assassinato de Amílcar Cabral','Assassination of Amílcar Cabral','Asesinato de Amílcar Cabral','political'],[1974,'Reconhecimento da independência da Guiné-Bissau','Recognition of Guinea-Bissau independence','Reconocimiento de la independencia de Guinea-Bisáu','political'],[1975,'Independências de Cabo Verde e São Tomé e Príncipe','Independence of Cape Verde and São Tomé and Príncipe','Independencias de Cabo Verde y Santo Tomé y Príncipe','political']]],
  ['timor-leste','Timor-Leste, ocupação e independência','Timor-Leste, occupation and independence','Timor Oriental, ocupación e independencia','SoutheastAsia','timor',[
    [1515,'Primeiros contatos portugueses documentados','First documented Portuguese contacts','Primeros contactos portugueses documentados','economic'],[1702,'Administração colonial sediada em Lifau','Colonial administration based in Lifau','Administración colonial con sede en Lifau','political'],[1769,'Transferência da capital para Díli','Transfer of the capital to Dili','Traslado de la capital a Dili','political'],[1942,'Ocupação japonesa de Timor','Japanese occupation of Timor','Ocupación japonesa de Timor','war'],[1974,'Revolução portuguesa e descolonização','Portuguese revolution and decolonization','Revolución portuguesa y descolonización','political'],[1975,'Declaração de independência e invasão indonésia','Declaration of independence and Indonesian invasion','Declaración de independencia e invasión indonesia','war'],[1991,'Massacre de Santa Cruz','Santa Cruz massacre','Masacre de Santa Cruz','social'],[1999,'Consulta popular sobre autonomia','Popular consultation on autonomy','Consulta popular sobre autonomía','political'],[2002,'Restauração da independência','Restoration of independence','Restauración de la independencia','political']]],
];

function sourceRecord([id, author, title, type, url]) {
  return { id, author, title, type, url, accessed: reviewed, scope: 'Síntese histórica e documentação primária ou institucional.', limitations: 'A fonte deve ser lida com atenção ao seu recorte institucional e historiográfico.' };
}

function makeEntity(topic, row, index) {
  const [slug, titlePt, titleEn, titleEs, region, sourceGroup] = topic;
  const [year, pt, en, es, type] = row;
  const id = `${slug}-${String(index + 1).padStart(2, '0')}`;
  const sourceIds = sources[sourceGroup].map(source => source[0]);
  return {
    id, nome: pt, nome_en: en, nome_es: es, inicio: year, fim: year,
    temporalPrecision: 'year', territorio: region, region, tipo: 'evento', type,
    tags: [slug, type, 'mundo-lusofono'], evidenceStatus: 'fact', sourceIds,
    descricao: `${pt} integra a sequência de ${titlePt.toLowerCase()} e deve ser interpretado em conexão com processos locais, atlânticos e globais.`,
    descricao_en: `${en} belongs to the sequence of ${titleEn.toLowerCase()} and should be interpreted through local, Atlantic and global processes.`,
    descricao_es: `${es} integra la secuencia de ${titleEs.toLowerCase()} y debe interpretarse mediante procesos locales, atlánticos y globales.`,
    importancia: 'O marco ajuda a relacionar instituições, conflitos, circulação de pessoas e disputas de memória sem reduzir a história à administração imperial.',
    importancia_en: 'This milestone connects institutions, conflicts, human mobility and contested memory without reducing history to imperial administration.',
    importancia_es: 'Este hito relaciona instituciones, conflictos, movilidad humana y memorias disputadas sin reducir la historia a la administración imperial.',
    perspectives: [
      { id: `${id}-institutional`, label: 'Institucional', note: 'Examina decisões, leis e estruturas de poder.' },
      { id: `${id}-social`, label: 'Social e local', note: 'Examina agência, resistência e experiências das populações afetadas.' },
    ],
  };
}

for (const topic of topics) {
  const [slug, titlePt, titleEn, titleEs, region, sourceGroup, events] = topic;
  const document = {
    meta: {
      tema: titlePt, theme_en: titleEn, tema_es: titleEs, lastReviewed: reviewed,
      reviewStatus: 'reviewed', evidenceStatus: 'mixed', collection: 'mundo-lusofono-v8',
      editorialNote: 'Síntese plural: combina história política, social e conectada. Datas representam marcos, não processos isolados.',
    },
    sources: sources[sourceGroup].map(sourceRecord),
    entidades: events.map((event, index) => makeEntity(topic, event, index)),
  };
  fs.writeFileSync(path.join(root, 'data', `dados-${slug}.json`), `${JSON.stringify(document, null, 2)}\n`);
}

console.log(`Generated ${topics.length} datasets and ${topics.reduce((total, topic) => total + topic[6].length, 0)} entities.`);
