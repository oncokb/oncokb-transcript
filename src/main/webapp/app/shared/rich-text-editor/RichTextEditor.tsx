import { Editor, Extensions } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import classNames from 'classnames';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isRichTextDoc, RichTextDoc } from './richTextSchema';
import * as styles from './RichTextEditor.module.scss';
import { plainTextToTipTapDoc, tipTapJsonToPlainText } from './utils';

export interface RichTextEditorChange {
  json: RichTextDoc;
  text: string;
}

export type RichTextPasteHandler = (text: string, editor: Editor) => boolean;

export interface RichTextSelectionRange {
  from: number;
  to: number;
}

interface RichTextEditorContextValue {
  editor: Editor | null;
  disabled: boolean;
  activeToolbarPopover: string | null;
  setActiveToolbarPopover: React.Dispatch<React.SetStateAction<string | null>>;
  editorWrapperRef: React.RefObject<HTMLDivElement>;
  saveEditorSelection: () => void;
  getSavedEditorSelection: () => RichTextSelectionRange | null;
}

const RichTextEditorContext = createContext<RichTextEditorContextValue | undefined>(undefined);
export const useRichTextEditorContext = () => {
  const context = useContext(RichTextEditorContext);
  if (!context) {
    throw new Error('useRichTextEditorContext must be used inside RichTextEditor');
  }
  return context;
};

export interface RichTextEditorProps {
  id?: string;
  content?: RichTextDoc;
  plainText?: string;
  extensions?: Extensions;
  pasteHandlers?: RichTextPasteHandler[];
  toolbarAddons?: React.ReactNode;
  overlayAddons?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  inputClassName?: string;
  onChange?: (change: RichTextEditorChange) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  content,
  plainText,
  extensions = [],
  pasteHandlers = [],
  toolbarAddons,
  overlayAddons,
  disabled = false,
  placeholder,
  invalid,
  inputClassName,
  onChange,
}) => {
  const [activeToolbarPopover, setActiveToolbarPopover] = useState<string | null>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const savedEditorSelectionRef = useRef<RichTextSelectionRange | null>(null);
  const configuredExtensions = useMemo(
    () => [
      // tiptap comes out the box with some of the basic text formattings, but we're
      // only using it for the document structure and custom extensions
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      ...extensions,
    ],
    [extensions, placeholder],
  );

  const editor = useEditor(
    {
      extensions: configuredExtensions,
      content: content ?? plainTextToTipTapDoc(plainText ?? ''),
      editable: !disabled,
      // Copying serializes each block (paragraph) via the clipboard text serializer, which
      // separates blocks with "\n\n" by default. Our paragraphs map to single lines, so use a
      // single newline to avoid doubling the blank lines between them.
      coreExtensionOptions: {
        clipboardTextSerializer: { blockSeparator: '\n' },
      },
      editorProps: {
        handleDOMEvents: {
          focus() {
            setIsEditorFocused(true);
            return false;
          },
          blur() {
            setIsEditorFocused(false);
            return false;
          },
        },
        handlePaste(_, event) {
          const text = event.clipboardData?.getData('text/plain');
          if (!text || !editor) return false;
          return pasteHandlers.some(handler => handler(text, editor));
        },
      },
      onUpdate({ editor: updatedEditor }) {
        const nextJson = updatedEditor.getJSON();
        const json = isRichTextDoc(nextJson) ? nextJson : plainTextToTipTapDoc(updatedEditor.getText({ blockSeparator: '\n' }));
        onChange?.({ json, text: tipTapJsonToPlainText(json) });
      },
    },
    [configuredExtensions],
  );

  useEffect(() => {
    if (!editor) return;
    if (isEditorFocused) return;
    editor.commands.setContent(content ?? plainTextToTipTapDoc(plainText ?? ''), false);
  }, [content, editor, isEditorFocused, plainText]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const saveEditorSelection = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    savedEditorSelectionRef.current = { from, to };
  };

  const getSavedEditorSelection = () => savedEditorSelectionRef.current;

  useEffect(() => {
    // when we click anywhere other than the toolbar popover, we want to close the popover
    if (!activeToolbarPopover) return;

    const handle = () => {
      setActiveToolbarPopover(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [activeToolbarPopover]);

  const contextValue = {
    editor,
    disabled,
    activeToolbarPopover,
    setActiveToolbarPopover,
    editorWrapperRef,
    saveEditorSelection,
    getSavedEditorSelection,
  };

  return (
    <RichTextEditorContext.Provider value={contextValue}>
      <div
        className={classNames(
          styles.editorWrapper,
          !disabled && styles.editable,
          disabled && styles.disabled,
          invalid && styles.invalid,
          inputClassName,
        )}
      >
        {!disabled && toolbarAddons && (
          <div className={styles.toolbarArea} onMouseDown={e => e.stopPropagation()}>
            <div className={styles.toolbar}>{toolbarAddons}</div>
          </div>
        )}
        <div ref={editorWrapperRef}>
          <EditorContent id={id} editor={editor} className={styles.editorContent} />
        </div>
      </div>
      {overlayAddons}
    </RichTextEditorContext.Provider>
  );
};

export default RichTextEditor;
