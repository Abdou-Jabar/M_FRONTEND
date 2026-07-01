import Image from "next/image"
import {
  ArrowRight,
  Bell,
  Check,
  CloudRain,
  Cpu,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  Lightbulb,
  LineChart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ScanSearch,
  Sprout,
  Sun,
  Thermometer,
  Waves,
  Wifi,
  Wind,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Esp32Model } from "@/components/esp32-model"

// En développement comme en production, on navigue par sous-domaine.
const IS_DEV = process.env.NODE_ENV !== "production"
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "agrismart.com"
const APP_URL = IS_DEV
  ? "http://app.localhost:3000"
  : `https://app.${ROOT_DOMAIN}`
const LOGIN_URL = `${APP_URL}/login`
const INSCRIPTION_URL = `${APP_URL}/inscription`

const NAV_LINKS = [
  { label: "Accueil", href: "#accueil" },
  { label: "Produit", href: "#produit" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "À propos", href: "#apropos" },
  { label: "FAQ", href: "#faq" },
]

// ───────────────────────────────────────────────────────────
// En-tête
// ───────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#accueil" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="text-lg">AgriSmart</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <a href={LOGIN_URL}>Connexion</a>
          </Button>
          <Button asChild>
            <a href={INSCRIPTION_URL}>Créer une organisation</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

// ───────────────────────────────────────────────────────────
// Hero — texte centré sur fond photo (serre agricole)
// ───────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="accueil" className="relative scroll-mt-16 overflow-hidden">
      {/* Fond photo + voile sombre (lisibilité garantie dans les deux thèmes) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/greenhouse-bg.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-28 text-center text-white sm:px-6 lg:py-36">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
          <Sprout className="size-4" />
          Agriculture intelligente
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Améliorez votre exploitation agricole
        </h1>
        <p className="max-w-2xl text-lg text-white/80">
          AgriSmart intègre la technologie connectée à vos parcelles pour
          surveiller, analyser et arroser vos cultures depuis n&apos;importe où
          dans le monde. Notre mission : moderniser le suivi du maraîchage, des
          serres et des cultures pour en simplifier la gestion.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={INSCRIPTION_URL}>
              Créer mon organisation
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <a href="#produit">Découvrir le produit</a>
          </Button>
        </div>

        {/* Aperçu temps réel en pastilles translucides */}
        <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroChip icon={<Thermometer className="size-4" />} label="Température" value="26 °C" />
          <HeroChip icon={<Droplets className="size-4" />} label="Humidité sol" value="62 %" />
          <HeroChip icon={<FlaskConical className="size-4" />} label="pH du sol" value="6.5" />
          <HeroChip icon={<Sun className="size-4" />} label="Luminosité" value="18 klx" />
        </div>
      </div>
    </section>
  )
}

function HeroChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-left backdrop-blur">
      <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 text-white">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold leading-none text-white">{value}</div>
        <div className="mt-1 text-xs text-white/70">{label}</div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────
// Produit — image de l'ESP-32 + description
// ───────────────────────────────────────────────────────────
const CAPTEURS = [
  { icon: <Thermometer className="size-5" />, label: "Température (air & sol)" },
  { icon: <Droplets className="size-5" />, label: "Humidité (air & sol)" },
  { icon: <Sun className="size-5" />, label: "Luminosité" },
  { icon: <FlaskConical className="size-5" />, label: "pH du sol" },
  { icon: <Sprout className="size-5" />, label: "NPK (azote, phosphore, potassium)" },
  { icon: <CloudRain className="size-5" />, label: "Détection de pluie" },
]

const ACTIONNEURS = [
  { icon: <Waves className="size-5" />, label: "Pompe d'irrigation" },
  { icon: <Wind className="size-5" />, label: "Ventilation" },
  { icon: <Lightbulb className="size-5" />, label: "Éclairage" },
  { icon: <Gauge className="size-5" />, label: "Vanne d'eau" },
]

function ProductSection() {
  return (
    <section id="produit" className="scroll-mt-16 border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-16 grid items-center gap-10 lg:grid-cols-2">
          {/* Modèle 3D interactif du dispositif (rotation auto + orbite souris) */}
          <div className="order-2 rounded-2xl border bg-gradient-to-b from-muted to-background p-2 shadow-sm lg:order-1">
            <div className="relative h-80 w-full sm:h-96">
              <Esp32Model />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Produit
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Le dispositif ESP-32
            </h2>
            <p className="mt-4 text-muted-foreground">
              L&apos;ESP-32 est un microcontrôleur surpuissant et économique,
              intégrant nativement le Wi-Fi et le Bluetooth. Elle
              collecte les données des capteurs installés sur vos parcelles puis
              les transmet vers le cloud, afin que vous y accédiez à distance, où
              que vous soyez. Le dispositif pilote aussi votre système
              d&apos;irrigation, en mode automatique ou manuel depuis le tableau
              de bord.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Cpu className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">Capteurs pris en charge</h3>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {CAPTEURS.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-sm">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
                    {c.icon}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wifi className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">Contrôle & connectivité</h3>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {ACTIONNEURS.map((a) => (
                <li key={a.label} className="flex items-center gap-3 text-sm">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
                    {a.icon}
                  </span>
                  {a.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Transmission sécurisée vers le cloud, accès à distance et
              extinction automatique des actionneurs (par exemple en cas de
              pluie) pour économiser l&apos;eau et l&apos;énergie.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────────────────
// Tarifs — fond photo (champ) + voile
// ───────────────────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="tarifs" className="relative scroll-mt-16 overflow-hidden border-b">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/field.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/70" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center text-white">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/90">
            Tarifs
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Des offres adaptées à votre exploitation
          </h2>
          <p className="mt-4 text-white/80">
            AgriSmart donne accès gratuitement aux fonctionnalités essentielles
            de surveillance et de contrôle. Nos abonnements ajoutent un support
            prioritaire, des mises à jour exclusives et le remplacement gratuit
            des pièces.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <PricingCard
            name="Offre gratuite"
            price="0 FCFA"
            period="/mois"
            cta="Commencer"
            highlighted={false}
            features={[
              { label: "Surveillance en temps réel", included: true },
              { label: "Contrôle manuel de l'irrigation", included: true },
              { label: "Accès depuis n'importe où", included: true },
              { label: "Support prioritaire", included: false },
              { label: "Mises à jour exclusives", included: false },
              { label: "Remplacement de pièces gratuit", included: false },
            ]}
          />
          <PricingCard
            name="AgriSmart+"
            price="15 000 FCFA"
            period="/mois"
            cta="Passer à AgriSmart+"
            highlighted
            features={[
              { label: "Surveillance en temps réel", included: true },
              { label: "Contrôle manuel de l'irrigation", included: true },
              { label: "Accès depuis n'importe où", included: true },
              { label: "Support prioritaire", included: true },
              { label: "Mises à jour exclusives", included: true },
              { label: "Remplacement de pièces gratuit", included: true },
            ]}
          />
        </div>
      </div>
    </section>
  )
}

function PricingCard({
  name,
  price,
  period,
  cta,
  highlighted,
  features,
}: {
  name: string
  price: string
  period: string
  cta: string
  highlighted: boolean
  features: { label: string; included: boolean }[]
}) {
  return (
    <div
      className={
        highlighted
          ? "relative rounded-2xl border-2 border-primary bg-card p-8 shadow-lg"
          : "rounded-2xl border bg-card p-8 shadow-lg"
      }
    >
      {highlighted && (
        <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Recommandé
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-6 flex flex-col gap-3">
        {features.map((f) => (
          <li
            key={f.label}
            className={
              f.included
                ? "flex items-center gap-3 text-sm"
                : "flex items-center gap-3 text-sm text-muted-foreground line-through"
            }
          >
            {f.included ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <X className="size-4 shrink-0 text-muted-foreground" />
            )}
            {f.label}
          </li>
        ))}
      </ul>
      <Button
        asChild
        className="mt-8 w-full"
        variant={highlighted ? "default" : "outline"}
      >
        <a href={INSCRIPTION_URL}>{cta}</a>
      </Button>
    </div>
  )
}

// ───────────────────────────────────────────────────────────
// À propos — image de serre + fonctionnalités du tableau de bord
// ───────────────────────────────────────────────────────────
const DASHBOARD_FEATURES = [
  {
    icon: <LineChart className="size-5" />,
    label: "Suivi des tendances en temps réel",
  },
  { icon: <Bell className="size-5" />, label: "Alertes personnalisées par seuil" },
  { icon: <Waves className="size-5" />, label: "Irrigation en un clic" },
  {
    icon: <ScanSearch className="size-5" />,
    label: "Diagnostic des maladies par IA",
  },
  {
    icon: <Gauge className="size-5" />,
    label: "Recommandations de seuils (aide à la décision)",
  },
  { icon: <MessageSquare className="size-5" />, label: "Messagerie d'équipe" },
]

function AboutSection() {
  return (
    <section id="apropos" className="scroll-mt-16 border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            À propos
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Ce que nous faisons
          </h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-muted-foreground">
            <p>
              Chez AgriSmart, nous associons la technologie à la nature pour
              créer des espaces cultivés plus intelligents et plus durables.
              Notre mission est de simplifier l&apos;entretien des cultures grâce
              à des solutions d&apos;automatisation innovantes, qui permettent de
              surveiller et de piloter ses parcelles à distance.
            </p>
            <p>
              Qu&apos;il s&apos;agisse d&apos;un petit potager ou d&apos;une
              grande serre, nous fournissons les outils pour que vos plantes
              reçoivent l&apos;attention dont elles ont besoin, automatiquement.
              Avec un engagement fort sur la qualité, l&apos;efficacité et la
              simplicité d&apos;usage, AgriSmart aide particuliers et
              professionnels à entretenir des cultures saines, avec un effort
              minimal.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm">
            <Image
              src="/images/greenhouse.jpg"
              alt="Intérieur d'une serre de culture"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm lg:order-1">
            <Image
              src="/images/plantation.jpg"
              alt="Rangées de plantations en plein champ"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="mb-2 text-lg font-semibold">Notre système</h3>
            <p className="mb-6 text-muted-foreground">
              Le tableau de bord AgriSmart est le centre de contrôle numérique.
              Accessible depuis tout appareil connecté, il affiche en temps réel
              les données de chaque dispositif : température, humidité de
              l&apos;air et du sol, luminosité, pH et bien plus. Vous suivez les
              tendances, recevez des alertes et déclenchez l&apos;irrigation en
              un clic.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {DASHBOARD_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {f.icon}
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────────────────
// FAQ (accordéon natif, sans JavaScript)
// ───────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Comment se passe l'installation ?",
    a: "Le dispositif est installé par un technicien qui se déplace sur le lieu indiqué et prend en charge l'ensemble de l'installation.",
  },
  {
    q: "Puis-je l'utiliser depuis mon téléphone ?",
    a: "La plateforme AgriSmart est accessible depuis n'importe quel appareil disposant d'une connexion internet.",
  },
  {
    q: "Comment ça fonctionne ?",
    a: "Le dispositif collecte les données des capteurs et les envoie vers un serveur, où elles sont ensuite affichées sur la plateforme en temps réel.",
  },
  {
    q: "Dois-je payer les réparations ?",
    a: "Oui. Les réparations ont un coût supplémentaire selon le problème, mais avec un abonnement AgriSmart+ actif, les réparations et le remplacement de pièces sont entièrement gratuits.",
  },
  {
    q: "Que se passe-t-il après le paiement ?",
    a: "Après l'achat du dispositif, l'un de nos agents vous contacte pour planifier une date d'installation.",
  },
]

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 border-b bg-muted/40">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            FAQ
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                {item.q}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────────────────
// Footer — fond photo sombre (serre agricole)
// ───────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/greenhouse-bg.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/80" aria-hidden />

      <div className="relative">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <a href="#accueil" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-5" />
              </span>
              <span className="text-lg">AgriSmart</span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              L&apos;agriculture intelligente, à portée de main. Surveillez et
              pilotez vos cultures, où que vous soyez.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Liens</h4>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                +228 90 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                contact@agrismart.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Lomé, Togo
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-white/60 sm:px-6">
            © {new Date().getFullYear()} AgriSmart. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ───────────────────────────────────────────────────────────
// Page d'accueil publique : agrismart.com (ou localhost:3000 en dev)
// ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-clip bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductSection />
        <PricingSection />
        <AboutSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
