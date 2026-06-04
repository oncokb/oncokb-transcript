import classNames from 'classnames';
import { Editor } from '@tiptap/core';
import React, { useState } from 'react';
import * as styles from '../RichTextEditor.module.scss';
import { RichTextSelectionRange, useRichTextEditorContext } from '../RichTextEditor';
import { RichTextInlineNode } from '../richTextSchema';
import { isSafeHttpUrl, normalizeHttpUrl } from '../utils';
import { buildAbstractReferenceNode, buildNctReferenceNode } from './ReferenceNodeExtensions';

const PMID_POPOVER_ID = 'pmid';
const NCT_POPOVER_ID = 'nct';
const ABSTRACT_POPOVER_ID = 'abstract';

interface ToolbarToggleButtonProps {
  popoverId: string;
  label: string;
  isOpen: boolean;
}

export const insertAtSavedEditorSelection = (
  editor: Editor,
  getSavedEditorSelection: () => RichTextSelectionRange | null,
  content: RichTextInlineNode,
) => {
  const selection = getSavedEditorSelection();
  const chain = editor.chain().focus();
  if (selection) {
    chain.setTextSelection(selection);
  }
  return chain.insertContent(content).run();
};

const ToolbarToggleButton: React.FC<ToolbarToggleButtonProps> = ({ popoverId, label, isOpen }) => {
  const { saveEditorSelection, setActiveToolbarPopover } = useRichTextEditorContext();
  return (
    <button
      type="button"
      className={classNames(styles.toolbarBtn, isOpen && styles.active)}
      onMouseDown={event => {
        event.preventDefault();
        saveEditorSelection();
        setActiveToolbarPopover(panel => (panel === popoverId ? null : popoverId));
      }}
      title={label}
    >
      {label}
    </button>
  );
};

export const PmidToolbarAddon: React.FC = () => {
  const { activeToolbarPopover, setActiveToolbarPopover, editor, getSavedEditorSelection } = useRichTextEditorContext();
  const [pmidInput, setPmidInput] = useState('');
  const isOpen = activeToolbarPopover === PMID_POPOVER_ID;

  const insertPmid = () => {
    const pmid = pmidInput.trim();
    if (!pmid || !editor) return;
    insertAtSavedEditorSelection(editor, getSavedEditorSelection, { type: 'pmidGroup', attrs: { pmids: [pmid] } });
    setPmidInput('');
    setActiveToolbarPopover(null);
  };

  return (
    <div className={styles.toolbarItem}>
      <ToolbarToggleButton popoverId={PMID_POPOVER_ID} label="+ PubMed" isOpen={isOpen} />
      {isOpen && (
        <div className={styles.toolbarPopover}>
          <div className={styles.refForm}>
            <input
              type="text"
              className={styles.refInput}
              placeholder="PubMed ID"
              value={pmidInput}
              onChange={event => setPmidInput(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && insertPmid()}
              autoFocus
            />
            <button type="button" className={styles.refInsertBtn} onClick={insertPmid}>
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const NctToolbarAddon: React.FC = () => {
  const { activeToolbarPopover, setActiveToolbarPopover, editor, getSavedEditorSelection } = useRichTextEditorContext();
  const [nctInput, setNctInput] = useState('');
  const isOpen = activeToolbarPopover === NCT_POPOVER_ID;

  const insertNct = () => {
    const nctId = nctInput.trim();
    if (!nctId || !editor) return;
    insertAtSavedEditorSelection(editor, getSavedEditorSelection, buildNctReferenceNode(nctId));
    setNctInput('');
    setActiveToolbarPopover(null);
  };

  return (
    <div className={styles.toolbarItem}>
      <ToolbarToggleButton popoverId={NCT_POPOVER_ID} label="+ NCT" isOpen={isOpen} />
      {isOpen && (
        <div className={styles.toolbarPopover}>
          <div className={styles.refForm}>
            <input
              type="text"
              className={styles.refInput}
              placeholder="NCT ID"
              value={nctInput}
              onChange={event => setNctInput(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && insertNct()}
              autoFocus
            />
            <button type="button" className={styles.refInsertBtn} onClick={insertNct}>
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AbstractToolbarAddon: React.FC = () => {
  const { activeToolbarPopover, setActiveToolbarPopover, editor, getSavedEditorSelection } = useRichTextEditorContext();
  const [abstractTitle, setAbstractTitle] = useState('');
  const [abstractLink, setAbstractLink] = useState('');
  const isOpen = activeToolbarPopover === ABSTRACT_POPOVER_ID;

  const insertAbstract = () => {
    const title = abstractTitle.trim();
    const href = normalizeHttpUrl(abstractLink);
    if (!title || !href || !editor || !isSafeHttpUrl(href)) return;
    insertAtSavedEditorSelection(editor, getSavedEditorSelection, buildAbstractReferenceNode(title, href));
    setAbstractTitle('');
    setAbstractLink('');
    setActiveToolbarPopover(null);
  };

  return (
    <div className={styles.toolbarItem}>
      <ToolbarToggleButton popoverId={ABSTRACT_POPOVER_ID} label="+ Abstract" isOpen={isOpen} />
      {isOpen && (
        <div className={styles.toolbarPopover}>
          <div className={styles.refForm}>
            <input
              type="text"
              className={styles.refInput}
              placeholder="Title"
              value={abstractTitle}
              onChange={event => setAbstractTitle(event.target.value)}
              autoFocus
            />
            <input
              type="text"
              className={styles.refInput}
              placeholder="URL"
              value={abstractLink}
              onChange={event => setAbstractLink(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && insertAbstract()}
            />
            <button type="button" className={styles.refInsertBtn} onClick={insertAbstract}>
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
