import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface RichTextEditorRef {
  getEditorElement: () => HTMLDivElement | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdating = useRef(false);

    useImperativeHandle(ref, () => ({
      getEditorElement: () => editorRef.current,
    }));

    useEffect(() => {
      if (editorRef.current && !isUpdating.current) {
        if (editorRef.current.innerHTML !== content) {
          editorRef.current.innerHTML = content;
        }
      }
    }, [content]);

    useEffect(() => {
      // Add event listener for image removal
      const handleImageClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-image-btn')) {
          const imageWrapper = target.closest('.image-wrapper');
          if (imageWrapper && editorRef.current) {
            imageWrapper.remove();
            handleInput();
          }
        }
      };

      const editor = editorRef.current;
      if (editor) {
        editor.addEventListener('click', handleImageClick);
        return () => editor.removeEventListener('click', handleImageClick);
      }
    }, []);

    const handleInput = () => {
      if (editorRef.current) {
        isUpdating.current = true;
        onChange(editorRef.current.innerHTML);
        setTimeout(() => {
          isUpdating.current = false;
        }, 0);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    return (
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="flex-1 p-4 focus:outline-none text-slate-900 dark:text-white"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        style={{
          minHeight: '200px',
        }}
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';