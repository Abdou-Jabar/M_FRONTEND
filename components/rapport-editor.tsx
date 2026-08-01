"use client"

// Éditeur de texte riche (WYSIWYG) pour le rapport d'intervention du technicien.
// Basé sur TipTap (@tiptap/react + starter-kit).
// Expose la valeur HTML via le callback onChange.

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RapportEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
}

// Bouton de la barre d'outils — défini en dehors du composant pour éviter
// la recréation à chaque rendu (erreur react-hooks/static-components).
function ToolBtn({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 shrink-0",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  )
}

export function RapportEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Décrivez l'intervention réalisée, les pièces remplacées, les réglages effectués…",
}: RapportEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border",
        disabled && "opacity-60",
      )}
    >
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
          disabled={disabled}
        >
          <Bold className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
          disabled={disabled}
        >
          <Italic className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné"
          disabled={disabled}
        >
          <UnderlineIcon className="size-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Titre"
          disabled={disabled}
        >
          <Heading2 className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
          disabled={disabled}
        >
          <List className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
          disabled={disabled}
        >
          <ListOrdered className="size-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
          disabled={disabled}
        >
          <AlignLeft className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centrer"
          disabled={disabled}
        >
          <AlignCenter className="size-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Aligner à droite"
          disabled={disabled}
        >
          <AlignRight className="size-4" />
        </ToolBtn>
      </div>

      {/* Zone de saisie */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus-within:outline-none min-h-[160px]"
      />
    </div>
  )
}
