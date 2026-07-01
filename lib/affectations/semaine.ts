// Utilitaires de gestion des semaines (lundi → dimanche) pour le filtrage
// des missions terminées par semaine.

export interface Semaine {
  debut: Date // lundi 00:00:00
  fin: Date // dimanche 23:59:59.999
}

// Renvoie la semaine (lundi → dimanche) contenant la date fournie.
export function semaineDe(date: Date): Semaine {
  const d = new Date(date)
  // getDay() : 0 = dimanche … 6 = samedi. On ramène au lundi.
  const jour = d.getDay()
  const decalageLundi = jour === 0 ? -6 : 1 - jour
  const debut = new Date(d)
  debut.setDate(d.getDate() + decalageLundi)
  debut.setHours(0, 0, 0, 0)
  const fin = new Date(debut)
  fin.setDate(debut.getDate() + 6)
  fin.setHours(23, 59, 59, 999)
  return { debut, fin }
}

// Décale une semaine de N semaines (négatif = passé, positif = futur).
export function decalerSemaine(semaine: Semaine, deltaSemaines: number): Semaine {
  const ref = new Date(semaine.debut)
  ref.setDate(ref.getDate() + deltaSemaines * 7)
  return semaineDe(ref)
}

// Vrai si la date (ISO string) tombe dans la semaine donnée.
export function dansLaSemaine(dateIso: string | null, semaine: Semaine): boolean {
  if (!dateIso) return false
  const t = new Date(dateIso).getTime()
  return t >= semaine.debut.getTime() && t <= semaine.fin.getTime()
}

// Vrai si deux semaines sont identiques (même lundi).
export function memeSemaine(a: Semaine, b: Semaine): boolean {
  return a.debut.getTime() === b.debut.getTime()
}

// Libellé lisible d'une semaine, ex. « 23 – 29 juin 2026 ».
export function libelleSemaine(semaine: Semaine): string {
  const { debut, fin } = semaine
  const memeMois = debut.getMonth() === fin.getMonth()
  const jourDebut = debut.toLocaleDateString("fr-FR", { day: "numeric" })
  const jourFin = fin.toLocaleDateString("fr-FR", { day: "numeric" })
  const moisAnnee = fin.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })
  if (memeMois) {
    return `${jourDebut} – ${jourFin} ${moisAnnee}`
  }
  const moisDebut = debut.toLocaleDateString("fr-FR", { month: "long" })
  return `${jourDebut} ${moisDebut} – ${jourFin} ${moisAnnee}`
}
