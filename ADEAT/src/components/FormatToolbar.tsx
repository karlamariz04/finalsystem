import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image, Highlighter, Type, Code, Quote, IndentIncrease, IndentDecrease,
  Undo, Redo, Superscript, Subscript, Link, Minus, CaseSensitive
} from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface FormatToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onImageInsert: () => void;
}

export function FormatToolbar({ onFormat, onImageInsert }: FormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const highlightColors = [
    { name: 'None', value: 'transparent' },
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Green', value: '#BBF7D0' },
    { name: 'Blue', value: '#BFDBFE' },
    { name: 'Pink', value: '#FBCFE8' },
    { name: 'Purple', value: '#E9D5FF' },
    { name: 'Orange', value: '#FED7AA' },
    { name: 'Red', value: '#FECACA' },
  ];

  const fontSizes = [
    { label: 'Tiny', value: '1' },
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Medium', value: '4' },
    { label: 'Large', value: '5' },
    { label: 'Extra Large', value: '6' },
    { label: 'Huge', value: '7' },
  ];

  const fontFamilies = [
    { label: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'ui-serif, Georgia, serif' },
    { label: 'Monospace', value: 'ui-monospace, monospace' },
    { label: 'Cursive', value: 'cursive' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
    { label: 'Impact', value: 'Impact, fantasy' },
  ];

  const formatButtons = [
    { icon: Bold, command: 'bold', label: 'Bold' },
    { icon: Italic, command: 'italic', label: 'Italic' },
    { icon: Underline, command: 'underline', label: 'Underline' },
    { icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
  ];

  const scriptButtons = [
    { icon: Superscript, command: 'superscript', label: 'Superscript' },
    { icon: Subscript, command: 'subscript', label: 'Subscript' },
  ];

  const headingButtons = [
    { icon: Heading1, command: 'formatBlock', value: 'h1', label: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', label: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', label: 'Heading 3' },
  ];

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
  ];

  const alignButtons = [
    { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
    { icon: AlignJustify, command: 'justifyFull', label: 'Justify' },
  ];

  const indentButtons = [
    { icon: IndentDecrease, command: 'outdent', label: 'Decrease Indent' },
    { icon: IndentIncrease, command: 'indent', label: 'Increase Indent' },
  ];

  const historyButtons = [
    { icon: Undo, command: 'undo', label: 'Undo' },
    { icon: Redo, command: 'redo', label: 'Redo' },
  ];

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50 backdrop-blur-sm">
      <ScrollArea className="w-full">
        {/* Compact Single Row - Essential Tools Only */}
        <div className="px-2 py-2 flex items-center gap-1 min-w-max">
          {/* History Controls */}
          {historyButtons.map((btn) => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 active:scale-95 transition-all flex-shrink-0 group"
              aria-label={btn.label}
            >
              <btn.icon className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          ))}
          
          <Separator orientation="vertical" className="h-5 mx-0.5 bg-gradient-to-b from-pink-200 to-purple-200 dark:from-pink-900/50 dark:to-purple-900/50" />
          
          {/* Basic Formatting */}
          {formatButtons.map((btn) => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 active:scale-95 transition-all flex-shrink-0 group"
              aria-label={btn.label}
            >
              <btn.icon className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          ))}

          <Separator orientation="vertical" className="h-5 mx-0.5 bg-gradient-to-b from-pink-200 to-purple-200 dark:from-pink-900/50 dark:to-purple-900/50" />
          
          {/* Lists */}
          {listButtons.map((btn) => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 active:scale-95 transition-all flex-shrink-0 group"
              aria-label={btn.label}
            >
              <btn.icon className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          ))}
          
          <Separator orientation="vertical" className="h-5 mx-0.5 bg-gradient-to-b from-pink-200 to-purple-200 dark:from-pink-900/50 dark:to-purple-900/50" />

          {/* Alignment - First 2 only */}
          {alignButtons.slice(0, 2).map((btn) => (
            <button
              key={btn.command}
              onClick={() => onFormat(btn.command)}
              className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 active:scale-95 transition-all flex-shrink-0 group"
              aria-label={btn.label}
            >
              <btn.icon className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          ))}

          <Separator orientation="vertical" className="h-5 mx-0.5 bg-gradient-to-b from-pink-200 to-purple-200 dark:from-pink-900/50 dark:to-purple-900/50" />
          
          {/* Image Insert */}
          <button
            onClick={onImageInsert}
            className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95 transition-all flex-shrink-0 shadow-md hover:shadow-lg group"
            aria-label="Insert Image"
          >
            <Image className="w-4 h-4 text-white transition-colors" />
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}