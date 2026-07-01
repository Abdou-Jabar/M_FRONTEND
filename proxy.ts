import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Dans Next.js 16, l'ancien « middleware » s'appelle désormais « proxy ».
// Ce fichier doit rester à la racine du projet et exporter une fonction `proxy`.
//
// Rôle de ce proxy : aiguiller les requêtes selon le sous-domaine.
//   - racine (localhost / agrismart.com)  -> page d'accueil (app/page.tsx)
//   - app.<domaine>                        -> espace utilisateurs (app/app/*)
//   - admin.<domaine>                      -> espace admin (app/admin/*)
//
// On utilise des réécritures (rewrite) plutôt que des redirections : l'URL
// affichée dans le navigateur reste propre (ex. app.localhost:3000/login).

// Domaine racine du site.
//   - En développement : « localhost » (valeur par défaut).
//   - En production : définissez NEXT_PUBLIC_ROOT_DOMAIN (ex. « agrismart.com »).
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost"

// Extrait le sous-domaine (« app », « admin », ...) à partir de l'en-tête host.
// Fonctionne en local (app.localhost:3000) comme en prod (app.agrismart.com).
function getSubdomain(host: string): string | null {
  // On retire le port éventuel (ex. « :3000 »).
  const hostname = host.split(":")[0]

  // ex. « app.localhost » ou « admin.agrismart.com »
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.slice(0, -(ROOT_DOMAIN.length + 1))
  }

  // Pas de sous-domaine (on est sur le domaine racine).
  return null
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const subdomain = getSubdomain(host)
  const url = request.nextUrl.clone()

  // --- Sous-domaine admin : admin.<domaine> ---
  if (subdomain === "admin") {
    // On préfixe le chemin par /admin pour servir le dossier app/admin.
    url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`
    return NextResponse.rewrite(url)
  }

  // --- Sous-domaine application : app.<domaine> ---
  if (subdomain === "app") {
    // On préfixe le chemin par /app pour servir le dossier app/app.
    url.pathname = `/app${url.pathname === "/" ? "" : url.pathname}`
    return NextResponse.rewrite(url)
  }

  // --- Domaine racine ---
  // On veut accéder aux espaces UNIQUEMENT par sous-domaine
  // (app.localhost:3000, admin.localhost:3000). Si quelqu'un tente un accès
  // direct par chemin (/app ou /admin) sur le domaine racine, on le renvoie
  // vers le bon sous-domaine pour garder une séparation nette.
  const targetSub = url.pathname.startsWith("/admin")
    ? "admin"
    : url.pathname.startsWith("/app")
      ? "app"
      : null

  if (targetSub) {
    // On enlève le préfixe /app ou /admin du chemin (ex. /app/login -> /login).
    const rest = url.pathname.replace(/^\/(app|admin)/, "") || "/"
    // On préfixe l'hôte courant par le sous-domaine : « localhost:3000 »
    // devient « app.localhost:3000 » (le port est conservé automatiquement).
    url.host = `${targetSub}.${host}`
    url.pathname = rest
    return NextResponse.redirect(url)
  }

  // Sinon, on laisse passer la requête normalement (page d'accueil).
  return NextResponse.next()
}

export const config = {
  // On exclut les fichiers internes de Next.js et les ressources statiques
  // pour ne pas exécuter le proxy inutilement sur le CSS, le JS ou les images.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
}
