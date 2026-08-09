// Types et énumérations liés aux actionneurs, alignés sur le backend
// (entité Actionneur, ActionneurRequest/Response, CommandeRequest,
// CommandeActionneurResponse).

// Type d'actionneur — voir TypeActionnneurEnum côté backend.
export type TypeActionneur =
  | "POMPE_IRRIGATION"
  | "VENTILATEUR"
  | "ECLAIRAGE"
  | "VANNE_EAU"

// Origine d'une commande — voir OrigineCommandeEnum côté backend.
export type OrigineCommande =
  | "MANUELLE"
  | "AUTO_SEUIL"
  | "AUTO_PLUIE"
  | "AUTO_EXTINCTION"

// Corps envoyé à POST/PUT /api/actionneurs.
export interface ActionneurRequest {
  nom: string
  type: TypeActionneur
  dispositifId: number
}

// Réponse renvoyée par l'API pour un actionneur.
export interface Actionneur {
  id: number
  nom: string
  type: TypeActionneur
  etatActuel: boolean
  estActif: boolean
  modeAuto: boolean
  dernireActivation: string | null
  dispositifId: number
  dispositifNom: string
  parcelleId: number
  parcelleNom: string
  dateExtinctionAuto: string | null
  dateExtinction: string | null
}

// Corps envoyé à POST /api/actionneurs/{id}/commande.
export interface CommandeRequest {
  etatDemande: boolean
  utilisateurId: number
  // Minuterie optionnelle (format yyyy-MM-ddTHH:mm:ss, activation uniquement).
  dateExtinctionAuto?: string
}

// Ligne d'historique renvoyée par GET /api/actionneurs/{id}/commandes.
export interface CommandeActionneur {
  id: number
  etatDemande: boolean
  dateCommande: string
  origine: OrigineCommande
  // Null pour les commandes système (pluie, seuils, extinction auto).
  utilisateurNomComplet: string | null
}

// Libellés lisibles (français) pour l'affichage du type d'actionneur.
export const TYPE_ACTIONNEUR_LABELS: Record<TypeActionneur, string> = {
  POMPE_IRRIGATION: "Pompe d'irrigation",
  VENTILATEUR: "Ventilateur",
  ECLAIRAGE: "Éclairage",
  VANNE_EAU: "Vanne d'eau",
}

// Libellés lisibles pour l'origine d'une commande.
export const ORIGINE_COMMANDE_LABELS: Record<OrigineCommande, string> = {
  MANUELLE: "Manuelle",
  AUTO_SEUIL: "Auto (seuils)",
  AUTO_PLUIE: "Auto (pluie)",
  AUTO_EXTINCTION: "Auto (minuterie)",
}
