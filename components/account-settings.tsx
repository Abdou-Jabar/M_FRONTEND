"use client"

// Page de paramètres de compte :
//  - Profil : photo (Supabase Storage), nom, prénom. L'email n'est PAS modifiable.
//    Le bouton d'enregistrement est désactivé tant que rien n'a changé.
//  - Mot de passe : changement (ancien + nouveau), section indépendante.

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api"
import { changerMotDePasse } from "@/lib/auth/auth-service"
import { useAuth } from "@/lib/auth/use-auth"
import {
  mettreAJourMonProfil,
  uploadMaPhoto,
} from "@/lib/utilisateurs/utilisateur-service"

function initiales(nom: string): string {
  const parts = nom.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AccountSettings() {
  const { user, mettreAJourUtilisateur } = useAuth()

  // Valeurs éditables du profil.
  const [nom, setNom] = useState(user?.nom ?? "")
  const [prenom, setPrenom] = useState(user?.prenom ?? "")
  const [fichier, setFichier] = useState<File | null>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const [profilBusy, setProfilBusy] = useState(false)
  const inputFichierRef = useRef<HTMLInputElement>(null)

  // Section mot de passe.
  const [ancien, setAncien] = useState("")
  const [nouveau, setNouveau] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [mdpBusy, setMdpBusy] = useState(false)

  // Nettoyage de l'URL de prévisualisation pour éviter les fuites mémoire.
  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu)
    }
  }, [apercu])

  if (!user) return null

  const nomComplet = `${user.prenom} ${user.nom}`.trim()
  const photoActuelle = apercu ?? user.photoUrl ?? ""

  // Le profil est « modifié » si le nom, le prénom, ou la photo ont changé.
  const profilModifie =
    nom.trim() !== user.nom ||
    prenom.trim() !== user.prenom ||
    fichier !== null

  const mdpComplet =
    ancien.length > 0 && nouveau.length > 0 && confirmation.length > 0

  function handleChoisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.")
      return
    }
    if (apercu) URL.revokeObjectURL(apercu)
    setFichier(f)
    setApercu(URL.createObjectURL(f))
  }

  async function handleEnregistrerProfil(e: React.FormEvent) {
    e.preventDefault()
    if (!profilModifie || profilBusy || !user) return
    setProfilBusy(true)
    try {
      let photoUrl = user.photoUrl

      // 1. Upload de la photo si une nouvelle a été sélectionnée.
      if (fichier) {
        const maj = await uploadMaPhoto(fichier)
        photoUrl = maj.photoUrl
      }

      // 2. Mise à jour du nom/prénom si modifiés.
      const nomChange = nom.trim() !== user.nom
      const prenomChange = prenom.trim() !== user.prenom
      if (nomChange || prenomChange) {
        await mettreAJourMonProfil({ nom: nom.trim(), prenom: prenom.trim() })
      }

      // 3. Synchronisation du store local (sidebar, avatar, etc.).
      mettreAJourUtilisateur({
        nom: nom.trim(),
        prenom: prenom.trim(),
        photoUrl,
      })

      // Réinitialise l'état "modifié".
      if (apercu) URL.revokeObjectURL(apercu)
      setFichier(null)
      setApercu(null)
      if (inputFichierRef.current) inputFichierRef.current.value = ""

      toast.success("Profil mis à jour.")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Mise à jour impossible.",
      )
    } finally {
      setProfilBusy(false)
    }
  }

  async function handleChangerMotDePasse(e: React.FormEvent) {
    e.preventDefault()
    if (mdpBusy) return

    if (nouveau.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (nouveau !== confirmation) {
      toast.error("La confirmation ne correspond pas au nouveau mot de passe.")
      return
    }
    if (nouveau === ancien) {
      toast.error("Le nouveau mot de passe doit être différent de l'ancien.")
      return
    }

    setMdpBusy(true)
    try {
      await changerMotDePasse({
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      })
      setAncien("")
      setNouveau("")
      setConfirmation("")
      toast.success("Mot de passe mis à jour.")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Changement impossible.",
      )
    } finally {
      setMdpBusy(false)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* ── Profil ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Votre photo et vos informations personnelles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnregistrerProfil} className="flex flex-col gap-6">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={photoActuelle} alt={nomComplet} />
                <AvatarFallback className="text-lg">
                  {initiales(nomComplet)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputFichierRef.current?.click()}
                  disabled={profilBusy}
                >
                  Changer la photo
                </Button>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG ou WEBP.
                </span>
                <input
                  ref={inputFichierRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChoisirFichier}
                />
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
              <Input
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                disabled={profilBusy}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="nom">Nom</FieldLabel>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                disabled={profilBusy}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={user.email} disabled readOnly />
            </Field>

            <div>
              <Button type="submit" disabled={!profilModifie || profilBusy}>
                {profilBusy ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Mot de passe ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>
            Modifiez votre mot de passe de connexion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleChangerMotDePasse}
            className="flex flex-col gap-6"
          >
            <Field>
              <FieldLabel htmlFor="ancien">Mot de passe actuel</FieldLabel>
              <Input
                id="ancien"
                type="password"
                autoComplete="current-password"
                value={ancien}
                onChange={(e) => setAncien(e.target.value)}
                disabled={mdpBusy}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="nouveau">Nouveau mot de passe</FieldLabel>
              <Input
                id="nouveau"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
                disabled={mdpBusy}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmation">
                Confirmer le nouveau mot de passe
              </FieldLabel>
              <Input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={mdpBusy}
              />
            </Field>

            <div>
              <Button type="submit" disabled={!mdpComplet || mdpBusy}>
                {mdpBusy ? "Modification…" : "Changer le mot de passe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
