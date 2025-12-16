export const modulesWithpostsNames = [
  {
    module: "Instalação e Ambiente",
    posts: [
      "O que é PHP?",
      "Instalando PHP no Windows",
      "Instalando PHP no Linux",
      "Configurando servidor local com XAMPP",
    ],
  },
  {
    module: "Conceitos Primários",
    posts: [
      "Variáveis em PHP",
      "Tipos de Dados em PHP",
      "Operadores em PHP",
      "Estruturas Condicionais",
    ],
  },
  {
    module: "Programação Orientada a Objetos",
    posts: [
      "Introdução à POO em PHP",
      "Classes e Objetos",
      "Propriedades e Métodos",
      "Herança em PHP",
    ],
  },
  {
    module: "Trabalhando com Banco de Dados",
    posts: [
      "Introdução ao PDO",
      "Conectando ao MySQL com PDO",
      "CRUD com PDO (SELECT, INSERT, UPDATE, DELETE)",
      "Tratamento de Erros com PDO",
    ],
  },
];

export const technologies = [
  {
    slug: "php",
    name: "PHP",
    category: "Linguagem",
    description:
      "O PHP (sigla recursiva para PHP: Hypertext Preprocessor) é uma linguagem de script open source (código aberto) de uso geral, mas criada especialmente para o desenvolvimento web.",
    date: "04/01/2025",
    modules: modulesWithpostsNames,
  },
  {
    slug: "laravel",
    name: "Laravel",
    category: "Framework",
    description:
      "Explore o Laravel, um framework PHP robusto e elegante, conhecido por sua sintaxe expressiva e ferramentas poderosas que facilitam o desenvolvimento de aplicações web modernas.",
    date: "30/11/2025",
    modules: [
      {
        module: "Introdução ao Laravel",
        posts: ["O que é Laravel?", "Instalação", "Estrutura de Pastas"],
      },
      {
        module: "Rotas e Controllers",
        posts: ["Definindo Rotas", "Controllers", "Middlewares"],
      },
    ],
  },
  {
    slug: "nextjs",
    name: "Next.js",
    category: "Framework",
    description:
      "Next.js é um framework React de código aberto que permite funcionalidades como renderização do lado do servidor e geração de sites estáticos para aplicações web baseadas em React.",
    date: "30/11/2025",
    modules: [
      {
        module: "Fundamentos",
        posts: ["App Router", "Pages vs App", "Layouts"],
      },
      {
        module: "Data Fetching",
        posts: ["Server Components", "Client Components", "Caching"],
      },
    ],
  },
];
