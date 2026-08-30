import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { useEffect, type CSSProperties } from "react";
import { sanitizeHtml } from "@/lib/format";

interface Props {
  value: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  style?: CSSProperties;
  className?: string;
  singleLine?: boolean;
  placeholder?: string;
  onEditor?: (editor: ReturnType<typeof useEditor>) => void;
}

export function RichText({
  value,
  onChange,
  onFocus,
  style,
  className,
  singleLine,
  placeholder,
  onEditor,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        "aria-label": placeholder ?? "Editable text",
        ...(singleLine ? { "data-single-line": "true" } : {}),
      },
      handleKeyDown: (_view, event) => {
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(sanitizeHtml(singleLine ? html.replace(/<\/?p[^>]*>/g, "") : html));
    },
    onFocus: () => onFocus?.(),
  });

  useEffect(() => {
    if (!editor) return;
    onEditor?.(editor);
  }, [editor, onEditor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = singleLine ? `<p>${value}</p>` : value || "<p></p>";
    if (current !== incoming && !editor.isFocused) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor, singleLine]);

  return (
    <EditorContent
      editor={editor}
      style={style}
      className={className}
      data-placeholder={placeholder}
    />
  );
}
