import processData from './data/process.json';
import ipc from './data/ipc.json';
import nutriterra from './data/nutriterra.json';

export type Block = { tag: string; text: string };

export const navigation = [
  { to: '/que-nos-inspira', label: 'Inspiración' },
  { to: '/proceso-transformacion', label: 'Transformación' },
  { to: '/nuestra-filosofia', label: 'Filosofía' },
  { to: '/clientes', label: 'Clientes' },
];

export const titles: Record<string, string> = {
  '/': 'Rompemos estructuras',
  '/que-nos-inspira': 'Qué nos inspira',
  '/proceso-transformacion': 'Proceso de transformación',
  '/nuestra-filosofia': 'Nuestra filosofía',
  '/clientes': 'Clientes',
  '/clientes/ipc': 'IPC Pools',
  '/clientes/nutriterra': 'Nutriterra',
};

export const phases = [
  {
    name: 'Analítica',
    duration: '1 a 2 meses',
    title: 'Generación de una hiperconciencia',
    image: 'velocimetro',
    description:
      'Entendemos dónde estás. Investigamos tu negocio, tu público y tu mercado para encontrar las oportunidades que importan.',
    items: ['Analítica interna y externa', 'Métricas clave del negocio', 'Investigación integral del mercado'],
    blocks: processData[0].blocks as Block[],
  },
  {
    name: 'Crecimiento',
    duration: '6 meses a 1 año',
    title: 'Potenciar tu negocio actual',
    image: 'bars',
    description:
      'Con la información crítica obtenida en la fase anterior, definimos un plan práctico que se adapta a tu realidad actual.',
    items: [
      'Tu estructura organizativa actual',
      'Los productos o servicios que ya ofrecés',
      'Las herramientas y nivel de desarrollo digital disponibles',
    ],
    blocks: processData[1].blocks as Block[],
  },
  {
    name: 'Más allá',
    duration: 'Luego del primer año',
    title: 'Planteo y desarrollo de nuevos desafíos',
    image: 'rocket',
    description:
      'Tras estabilizar las necesidades críticas y orientar los esfuerzos hacia los objetivos definidos, es momento de expandir la visión de valor de tu empresa.',
    items: ['Explorar nuevos mercados y segmentos', 'Lanzar nuevos productos o servicios', 'Desarrollar nuevas marcas'],
    blocks: processData[2].blocks as Block[],
  },
];

export const cases = [
  {
    slug: 'ipc',
    name: 'IPC Pools',
    category: 'Liderazgo y posicionamiento',
    period: '2023 — 2024',
    alt: 'Piscina IPC Pools en un jardín',
    share: 32.5,
    shareLabel: 'de visitas',
    stats: [
      ['+19k', 'visitas orgánicas en la web'],
      ['+60%', 'aumento de flujo de personas'],
      ['+220k', 'reproducciones en el spot de YouTube'],
    ],
    data: ipc as { intro: string; blocks: Block[] },
  },
  {
    slug: 'nutriterra',
    name: 'Nutriterra',
    category: 'Estrategia y expansión',
    period: '2024 — actualidad',
    alt: 'Cultivos de Nutriterra',
    share: 25.6,
    shareLabel: 'del tráfico',
    stats: [
      ['+2000', 'nuevos prospectos comerciales generados'],
      ['+500%', 'aumento de flujo de personas'],
      ['+25%', 'aumento en la base de datos'],
    ],
    data: nutriterra as { intro: string; blocks: Block[] },
  },
];

export const inspirations = [
  {
    name: 'Nike',
    tag: 'Romper las reglas',
    image: 'phil_knight',
    alt: 'Phil Knight con un calzado Nike',
    text: 'De ser los nuevos en la cancha a cambiar las reglas del juego. Apostaron por los rebeldes del deporte y llevaron su estilo a las calles.',
  },
  {
    name: 'The Beatles',
    tag: 'Crear un movimiento',
    image: 'beatles-fondo',
    alt: 'Arte de The Beatles',
    text: 'No solo hicieron música, crearon un movimiento global. Con la "Invasión Británica", rompieron fronteras y marcaron la historia del rock.',
  },
  {
    name: 'YSY y Duki',
    tag: 'Hacer historia desde el barrio',
    image: 'dukiysy',
    alt: 'YSY A y Duki en El Quinto Escalón',
    text: 'Transformaron la improvisación de barrio en un fenómeno masivo. Desde El Quinto Escalón, le dieron ritmo y voz a toda una generación.',
  },
];

// Rangos de scroll (0 a 1) que ocupa cada capítulo de la historia.
export const chapters = [
  {
    label: 'Las personas',
    from: 0,
    to: 0.2,
    title: ['Todo empieza con', 'una necesidad.'],
    text: 'Las personas tenemos miles, incluso millones de necesidades que se manifiestan en función de nuestras creencias, experiencias, rutinas, cultura y demás variables.',
  },
  {
    label: 'Las empresas',
    from: 0.2,
    to: 0.42,
    title: ['Y del otro lado,', 'una empresa.'],
    text: 'Las empresas son entidades que se crean para satisfacer necesidades de las personas.',
  },
  {
    label: 'El encuentro',
    from: 0.42,
    to: 0.68,
    title: ['Cuando se encuentran,', 'se enciende todo.'],
    text: 'Se genera un círculo virtuoso con múltiples beneficios: los usuarios satisfacen sus necesidades mediante empresas afines a sus valores.',
  },
  {
    label: 'El efecto',
    from: 0.68,
    to: 0.89,
    title: ['Más claridad,', 'mejor vida.'],
    text: 'Mientras más claras sean las propuestas de valor de las empresas y sus procesos estratégicos, mejor será el nivel de vida de las personas a las que apuntan y la progresión económica de los que hacen a las organizaciones.',
  },
  {
    label: 'Infinito',
    from: 0.89,
    to: 1,
    title: ['Un sistema infinito', 'y exponencial.'],
    text: 'Pero lo verdaderamente gratificante es que este sistema no se agota: cada necesidad resuelta enciende la siguiente.',
  },
];
