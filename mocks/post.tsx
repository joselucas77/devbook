import { Post } from "@/types/globalTypes";

export const postsByModuleMock: Post = {
  id: 1,
  categoryId: 1,
  moduleId: 2,
  title: "Variáveis em PHP",
  slug: "variaveis-em-php",
  concept:
    "Entenda o que são variáveis, como declarar e boas práticas de nomeação em PHP.",
  content: `
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
    "Introdução às variáveis em PHP: sintaxe, regras básicas e primeiros exemplos.",
  isPublic: true,
  status: "PUBLISHED" as Post["status"],
  createdAt: new Date("2025-01-02T10:00:00Z"),
  updatedAt: new Date("2025-01-02T10:00:00Z"),
  publishedAt: new Date("2025-01-02T10:00:00Z"),
};

export const postsByModuleListMock: Post[] = [postsByModuleMock];
