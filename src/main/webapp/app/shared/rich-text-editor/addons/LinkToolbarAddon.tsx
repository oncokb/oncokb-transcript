import classNames from 'classnames';
import React, { useState } from 'react';
import * as styles from '../RichTextEditor.module.scss';
import { useRichTextEditorContext } from '../RichTextEditor';
import { isSafeHttpUrl, normalizeHttpUrl } from '../utils';
import { GenericLink } from './ReferenceNodeExtensions';
import { insertAtSavedEditorSelection } from './ReferenceToolbarAddon';

export { GenericLink as genericLinkExtension };

const POPOVER_ID = 'link';

export const LinkToolbarAddon: React.FC = () => {
  const { activeToolbarPopover, setActiveToolbarPopover, editor, saveEditorSelection, getSavedEditorSelection } =
    useRichTextEditorContext();
  const [linkUrl, setLinkUrl] = useState('');
  const isOpen = activeToolbarPopover === POPOVER_ID;

  const insertGenericLink = () => {
    const href = normalizeHttpUrl(linkUrl);
    if (!href || !editor || !isSafeHttpUrl(href)) return;
    insertAtSavedEditorSelection(editor, getSavedEditorSelection, { type: 'genericLink', attrs: { href, text: href } });
    setLinkUrl('');
    setActiveToolbarPopover(null);
  };

  return (
    <div className={styles.toolbarItem}>
      <button
        type="button"
        className={classNames(styles.toolbarBtn, isOpen && styles.active)}
        onMouseDown={event => {
          event.preventDefault();
          saveEditorSelection();
          setActiveToolbarPopover(panel => (panel === POPOVER_ID ? null : POPOVER_ID));
        }}
        title="Link"
      >
        + Link
      </button>
      {isOpen && (
        <div className={styles.toolbarPopover}>
          <div className={styles.refForm}>
            <input
              type="text"
              className={styles.refInput}
              placeholder="URL"
              value={linkUrl}
              onChange={event => setLinkUrl(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && insertGenericLink()}
              autoFocus
            />
            <button type="button" className={styles.refInsertBtn} onClick={insertGenericLink}>
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
