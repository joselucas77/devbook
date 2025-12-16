import { PostPageData } from "@/types/globalTypes";

export const phpVariaveis: PostPageData = {
  technology: {
    id: 1,
    name: "PHP",
    slug: "php",
    description:
      "PHP é uma linguagem de script amplamente usada para desenvolvimento web do lado do servidor.",
    image:
      "https://lh3.googleusercontent.com/pw/AP1GczOCw36SEx7Y9OdUYyE9jVHRIv5wYgVFdFpfVGUirzJqdNSEMZ0YceQtG9FZZQ63W8dmI6vdqvTYgl69xrk3ieYMXIxA2Zyb_RC4Nkca8b1ob78Ku2Z-95KtNMT2x0aWy9yJ7DhvnMd3Q-oNCmIuwdJuPA=w1455-h970-s-no-gm?authuser=0",
    category: {
      id: 1,
      name: "Linguagens",
      slug: "linguagens",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-05T00:00:00Z"),
  },
  module: {
    id: 1,
    categoryId: 1,
    name: "Conceitos Primários",
    slug: "conceitos-primarios",
    description:
      "Fundamentos essenciais para começar a programar em PHP, como variáveis, tipos, condicionais e loops.",
    orderIndex: 1,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-05T00:00:00Z"),
  },
  post: {
    id: 1,
    categoryId: 1,
    moduleId: 1,
    title: "Variáveis em PHP",
    slug: "variaveis",
    concept:
      "Variáveis em PHP são “caixinhas” na memória usadas para armazenar valores durante a execução do script. Sempre começam com o símbolo $.",

    content: `
# Variáveis em PHP

Variáveis são fundamentais em qualquer linguagem de programação. No PHP, **toda variável começa com o símbolo \`$\`**.

## Regras básicas

- Devem começar com **\`$\`** seguido de uma letra ou _underscore_
- Não podem começar com número
- Podem conter letras, números e underscore (\`_\`)
- São **case-sensitive** (\`$nome\` é diferente de \`$Nome\`)

## Exemplo simples

\`\`\`php
<?php

$nome = "Lucas";
$idade = 22;
$altura = 1.75;
$ativo = true;

echo "Meu nome é $nome e tenho $idade anos.";
\`\`\`

## Tipagem dinâmica

Em PHP, o tipo da variável é definido automaticamente pelo valor atribuído:

\`\`\`php
<?php

$valor = 10;        // inteiro
$valor = 10.5;      // float
$valor = "dez";     // string
$valor = false;     // boolean
\`\`\`

## Boas práticas de nomeação

- Use nomes **descritivos**: \`$quantidadeUsuarios\`, \`$precoTotal\`
- Evite nomes genéricos: \`$x\`, \`$var\`, \`$coisa\`
- Use **camelCase** ou **snake_case**, mas mantenha um padrão

## Exemplo mais completo

\`\`\`php
<?php

$produto = "Teclado Mecânico";
$preco = 299.90;
$quantidade = 2;

$total = $preco * $quantidade;

echo "Produto: $produto \\n";
echo "Quantidade: $quantidade \\n";
echo "Total: R$ " . number_format($total, 2, ',', '.');
\`\`\`

Neste exemplo, usamos várias variáveis para representar um pequeno carrinho de compras e calculamos o total.
`,
    summary:
      "Neste tópico, você aprendeu o que são variáveis em PHP, como declará-las, as regras básicas de nomeação, tipagem dinâmica e viu exemplos práticos de uso no dia a dia.",

    difficulty: "Iniciante",
    readingTime: 8,
    isPublic: true,
    status: "PUBLICADO",
    createdAt: new Date("2025-01-02T00:00:00Z"),
    updatedAt: new Date("2025-01-06T00:00:00Z"),
    publishedAt: new Date("2025-01-06T00:00:00Z"),
  },
};
