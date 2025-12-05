import { 
  Bold, Italic, Underline, Strikethrough, ChevronDown, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

interface FormattingPanelProps {
  onFormat: (command: string, value?: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

export function FormattingPanel({ onFormat, editorRef }: FormattingPanelProps) {
  const [selectedFont, setSelectedFont] = useState('Sans Serif');
  const [selectedSize, setSelectedSize] = useState('Normal');
  const [selectedHeading, setSelectedHeading] = useState('Normal');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedHighlight, setSelectedHighlight] = useState('transparent');
  const [activeEffects, setActiveEffects] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  // Update formatting state based on current selection
  useEffect(() => {
    const updateFormattingState = () => {
      try {
        // Check bold
        const isBold = document.queryCommandState('bold');
        // Check italic
        const isItalic = document.queryCommandState('italic');
        // Check underline
        const isUnderline = document.queryCommandState('underline');
        // Check strikethrough
        const isStrikethrough = document.queryCommandState('strikeThrough');

        setActiveEffects({
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
          strikethrough: isStrikethrough,
        });

        // Get font size
        const fontSize = document.queryCommandValue('fontSize');
        const sizeMap: { [key: string]: string } = {
          '1': 'Tiny',
          '2': 'Small',
          '3': 'Normal',
          '4': 'Medium',
          '5': 'Large',
          '6': 'Extra Large',
          '7': 'Huge',
        };
        if (fontSize && sizeMap[fontSize]) {
          setSelectedSize(sizeMap[fontSize]);
        }

        // Get font family
        const fontFamily = document.queryCommandValue('fontName');
        if (fontFamily) {
          const cleanFont = fontFamily.replace(/['"]/g, '');
          const fontMap: { [key: string]: string } = {
            'ui-sans-serif': 'Sans Serif',
            'system-ui': 'Sans Serif',
            'sans-serif': 'Sans Serif',
            'ui-serif': 'Serif',
            'Georgia': 'Serif',
            'serif': 'Serif',
            'ui-monospace': 'Monospace',
            'monospace': 'Monospace',
            'cursive': 'Cursive',
            'Arial': 'Arial',
            'Times New Roman': 'Times New Roman',
            'Courier New': 'Courier New',
            'Comic Sans MS': 'Comic Sans',
          };
          
          for (const [key, value] of Object.entries(fontMap)) {
            if (cleanFont.includes(key)) {
              setSelectedFont(value);
              break;
            }
          }
        }

        // Get text color
        const foreColor = document.queryCommandValue('foreColor');
        if (foreColor) {
          // Convert rgb to hex if needed
          const color = rgbToHex(foreColor);
          setSelectedColor(color);
        }

        // Get highlight color
        const backColor = document.queryCommandValue('backColor');
        if (backColor && backColor !== 'rgba(0, 0, 0, 0)') {
          const color = rgbToHex(backColor);
          setSelectedHighlight(color);
        } else {
          setSelectedHighlight('transparent');
        }

        // Get block format (heading)
        const formatBlock = document.queryCommandValue('formatBlock');
        const headingMap: { [key: string]: string } = {
          'h1': 'Heading 1',
          'h2': 'Heading 2',
          'h3': 'Heading 3',
          'p': 'Normal',
          'div': 'Normal',
        };
        if (formatBlock && headingMap[formatBlock.toLowerCase()]) {
          setSelectedHeading(headingMap[formatBlock.toLowerCase()]);
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    // Listen for selection changes
    const handleSelectionChange = () => {
      updateFormattingState();
    };

    // Listen for mouseup and keyup in the editor
    const handleEditorInteraction = () => {
      setTimeout(updateFormattingState, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    if (editorRef?.current) {
      const editor = editorRef.current;
      editor.addEventListener('mouseup', handleEditorInteraction);
      editor.addEventListener('keyup', handleEditorInteraction);
      editor.addEventListener('focus', handleEditorInteraction);
      
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        editor.removeEventListener('mouseup', handleEditorInteraction);
        editor.removeEventListener('keyup', handleEditorInteraction);
        editor.removeEventListener('focus', handleEditorInteraction);
      };
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef]);

  // Helper function to convert RGB to Hex
  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const fontFamilies = [
    { label: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'ui-serif, Georgia, serif' },
    { label: 'Monospace', value: 'ui-monospace, monospace' },
    { label: 'Cursive', value: 'cursive' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
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

  const headings = [
    { label: 'Normal', value: 'p' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
  ];

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
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
  ];

  const handleFontChange = (font: { label: string; value: string }) => {
    setSelectedFont(font.label);
    onFormat('fontName', font.value);
  };

  const handleSizeChange = (size: { label: string; value: string }) => {
    setSelectedSize(size.label);
    onFormat('fontSize', size.value);
  };

  const handleHeadingChange = (heading: { label: string; value: string }) => {
    setSelectedHeading(heading.label);
    onFormat('formatBlock', heading.value);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onFormat('foreColor', color);
  };

  const handleHighlightChange = (color: string) => {
    setSelectedHighlight(color);
    onFormat('backColor', color);
  };

  const toggleEffect = (effect: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    const commandMap = {
      bold: 'bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'strikeThrough',
    };
    
    onFormat(commandMap[effect]);
    setActiveEffects(prev => ({ ...prev, [effect]: !prev[effect] }));
  };

  return (
    <div className="bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-900 dark:to-purple-950/30 border-t border-pink-200 dark:border-purple-900/50 backdrop-blur-sm">
      <div className="px-3 py-2">
        {/* Main Controls Row */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {/* Font Family */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left border-pink-200 dark:border-purple-900/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 h-8 px-2 text-xs"
              >
                <span className="truncate text-xs">{selectedFont}</span>
                <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 border-pink-200 dark:border-purple-900/50">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {fontFamilies.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleFontChange(font)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-all text-sm"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Font Size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left border-pink-200 dark:border-purple-900/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 h-8 px-2 text-xs"
              >
                <span className="truncate text-xs">{selectedSize}</span>
                <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 border-pink-200 dark:border-purple-900/50">
              <div className="space-y-1">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleSizeChange(size)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-all text-sm"
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left border-pink-200 dark:border-purple-900/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 h-8 px-2 text-xs"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-xs">Color</span>
                </div>
                <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3 border-pink-200 dark:border-purple-900/50">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Select Text Color</p>
              <div className="grid grid-cols-3 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-all group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-purple-400 dark:group-hover:border-pink-400 transition-all"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{color.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Heading Style */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left border-pink-200 dark:border-purple-900/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 h-8 px-2 text-xs"
              >
                <span className="truncate text-xs">{selectedHeading}</span>
                <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 border-pink-200 dark:border-purple-900/50">
              <div className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.value}
                    onClick={() => handleHeadingChange(heading)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-all text-sm"
                  >
                    {heading.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Text Effects & Highlight Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleEffect('bold')}
              className={`p-1.5 rounded-lg transition-all ${
                activeEffects.bold
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 border border-pink-200 dark:border-purple-900/50'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleEffect('italic')}
              className={`p-1.5 rounded-lg transition-all ${
                activeEffects.italic
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 border border-pink-200 dark:border-purple-900/50'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleEffect('underline')}
              className={`p-1.5 rounded-lg transition-all ${
                activeEffects.underline
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 border border-pink-200 dark:border-purple-900/50'
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleEffect('strikethrough')}
              className={`p-1.5 rounded-lg transition-all ${
                activeEffects.strikethrough
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 border border-pink-200 dark:border-purple-900/50'
              }`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Highlight Color - Compact */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 px-2 border-pink-200 dark:border-purple-900/50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: selectedHighlight }}
                  />
                  <span className="text-xs">Highlight</span>
                </div>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3 border-pink-200 dark:border-purple-900/50">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Select Highlight</p>
              <div className="grid grid-cols-3 gap-2">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleHighlightChange(color.value)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-all group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-purple-400 dark:group-hover:border-pink-400 transition-all"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{color.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}