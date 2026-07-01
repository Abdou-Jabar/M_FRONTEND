// Configuration centralisée du frontend.
//
// L'URL de base de l'API pointe vers le backend Spring Boot. En développement,
// Spring Boot tourne par défaut sur le port 8080. On peut la surcharger via la
// variable d'environnement NEXT_PUBLIC_API_URL (ex. en production).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

// Préfixe commun de toutes les routes de l'API (voir @RequestMapping côté Spring).
export const API_PREFIX = "/api"
