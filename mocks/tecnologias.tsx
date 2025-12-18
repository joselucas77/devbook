export const linguagensCategory = {
  id: 1,
  name: "Linguagem",
  slug: "linguagem",
  icon: "Code",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

// ✅ tecnologia PHP (para /tecnologias e para o resto)
export const phpTechnology = {
  id: 1,
  name: "PHP",
  slug: "php",
  description:
    "O PHP (sigla recursiva para PHP: Hypertext Preprocessor) é uma linguagem de script open source (código aberto) de uso geral, mas criada especialmente para o desenvolvimento web.",
  image:
    "https://lh3.googleusercontent.com/pw/AP1GczOCw36SEx7Y9OdUYyE9jVHRIv5wYgVFdFpfVGUirzJqdNSEMZ0YceQtG9FZZQ63W8dmI6vdqvTYgl69xrk3ieYMXIxA2Zyb_RC4Nkca8b1ob78Ku2Z-95KtNMT2x0aWy9yJ7DhvnMd3Q-oNCmIuwdJuPA=w1455-h970-s-no-gm?authuser=0",
  category: linguagensCategory,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-05T00:00:00Z"),
};

// lista para página /tecnologias
export const technologiesMock = [phpTechnology];
