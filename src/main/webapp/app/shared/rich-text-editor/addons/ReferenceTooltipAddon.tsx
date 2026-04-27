import React, { useEffect, useRef, useState } from 'react';
import { FiCopy, FiEdit2, FiExternalLink, FiX } from 'react-icons/fi';
import classNames from 'classnames';
import * as styles from '../RichTextEditor.module.scss';
import { useRichTextEditorContext } from '../RichTextEditor';
import { isSafeHttpUrl, normalizeHttpUrl } from '../utils';
import { getNctHref, normalizeNctId } from './ReferenceNodeExtensions';
import { getPubmedArticleHref } from 'app/shared/util/pubmed';

const TOOLTIP_HIDE_DELAY_MS = 120;

interface GenericLinkTooltipState {
  type: 'generic';
  href: string;
  text: string;
  el: HTMLElement;
}

interface AbstractReferenceTooltipState {
  type: 'abstractReference';
  title: string;
  href: string;
  el: HTMLElement;
}

interface NctReferenceTooltipState {
  type: 'nctReference';
  nctId: string;
  href: string;
  el: HTMLElement;
}

interface PmidGroupTooltipState {
  pmids: string[];
  el: HTMLElement;
}

type LinkTooltipState = GenericLinkTooltipState | AbstractReferenceTooltipState | NctReferenceTooltipState;

export const ReferenceTooltipAddon: React.FC = () => {
  const { disabled, editor, editorWrapperRef } = useRichTextEditorContext();
  const linkTooltipRef = useRef<HTMLDivElement>(null);
  const pmidGroupTooltipRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditingLinkRef = useRef(false);

  const [linkTooltip, setLinkTooltip] = useState<LinkTooltipState | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editLinkValue, setEditLinkValue] = useState('');
  const [editAbstractTitle, setEditAbstractTitle] = useState('');

  const [pmidGroupTooltip, setPmidGroupTooltip] = useState<PmidGroupTooltipState | null>(null);
  const [addPmidInput, setAddPmidInput] = useState('');
  const [editingPmid, setEditingPmid] = useState<string | null>(null);
  const [editingPmidValue, setEditingPmidValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    isEditingLinkRef.current = isEditingLink;
  }, [isEditingLink]);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const isTargetInsideTooltip = (target: EventTarget | null) => {
    if (!(target instanceof Node)) {
      return false;
    }
    return !!linkTooltipRef.current?.contains(target) || !!pmidGroupTooltipRef.current?.contains(target);
  };

  const clearTooltips = () => {
    setLinkTooltip(null);
    setIsEditingLink(false);
    setPmidGroupTooltip(null);
    setAddPmidInput('');
    setEditingPmid(null);
    setEditingPmidValue('');
  };

  const scheduleHide = (event?: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    // If the mouse moved directly into a tooltip, don't hide.
    if (event && isTargetInsideTooltip(event.relatedTarget)) {
      clearHideTimer();
      return;
    }

    // Short delay so the mouse has time to travel the gap between the source element and the tooltip
    // before we close. The tooltip's onMouseEnter cancels this timer if the mouse arrives in time.
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!isEditingLinkRef.current) {
        setLinkTooltip(null);
        setPmidGroupTooltip(null);
      }
    }, TOOLTIP_HIDE_DELAY_MS);
  };

  const keepTooltipOpen = () => {
    clearHideTimer();
  };

  const showPmidGroupTooltip = (el: HTMLElement) => {
    clearHideTimer();
    const pmids: string[] = el.dataset.pmids ? JSON.parse(el.dataset.pmids) : [];
    setLinkTooltip(null);
    setPmidGroupTooltip({ pmids, el });
  };

  const showReferenceNodeTooltip = (el: HTMLElement) => {
    clearHideTimer();
    setPmidGroupTooltip(null);
    if ('abstractReference' in el.dataset) {
      setLinkTooltip({ type: 'abstractReference', title: el.dataset.title ?? '', href: el.getAttribute('href') ?? '', el });
    } else {
      const nctId = normalizeNctId(el.dataset.nctId ?? '');
      setLinkTooltip({ type: 'nctReference', nctId, href: getNctHref(nctId), el });
    }
    setIsEditingLink(false);
  };

  const showGenericLinkTooltip = (el: HTMLElement) => {
    clearHideTimer();
    setPmidGroupTooltip(null);
    setLinkTooltip({ type: 'generic', href: el.dataset.href ?? '', text: el.dataset.text ?? '', el });
    setIsEditingLink(false);
  };

  const nodePos = (el: HTMLElement): number | null => {
    // Helps us find the position of a node in TipTap's DOM
    if (!editor) return null;
    const raw = editor.view.posAtDOM(el, 0);
    return [raw, raw - 1].find(c => c >= 0 && editor.state.doc.nodeAt(c)) ?? null;
  };

  useEffect(() => {
    const shell = editorWrapperRef.current;
    if (!shell || !editor) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if ('pmidGroup' in target.dataset) {
        showPmidGroupTooltip(target);
        return;
      }
      if ('abstractReference' in target.dataset || 'nctReference' in target.dataset) {
        showReferenceNodeTooltip(target);
        return;
      }
      if ('genericLink' in target.dataset) {
        showGenericLinkTooltip(target);
      }
    };

    shell.addEventListener('mouseover', handleMouseOver);
    shell.addEventListener('mouseleave', scheduleHide);
    return () => {
      shell.removeEventListener('mouseover', handleMouseOver);
      shell.removeEventListener('mouseleave', scheduleHide);
    };
  }, [editor, editorWrapperRef]);

  useEffect(() => {
    if (!linkTooltip && !pmidGroupTooltip) return;

    const handle = (event: MouseEvent) => {
      const target = event.target as Node;
      const inLink = linkTooltipRef.current?.contains(target);
      const inPmid = pmidGroupTooltipRef.current?.contains(target);
      if (!inLink && !inPmid) {
        clearTooltips();
      }
    };

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [linkTooltip, pmidGroupTooltip]);

  useEffect(() => () => clearHideTimer(), []);

  const removeLink = () => {
    if (!editor || !linkTooltip) return;
    const pos = nodePos(linkTooltip.el);
    if (pos === null) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .run();
    clearTooltips();
  };

  const saveEditedLink = () => {
    if (!editor || !linkTooltip) return;

    if (linkTooltip.type === 'generic') {
      const newHref = normalizeHttpUrl(editLinkValue);
      if (!newHref || !isSafeHttpUrl(newHref)) return;
      const pos = nodePos(linkTooltip.el);
      if (pos === null) return;
      // updates the node's attributes in place without replacing it (when a user changes the URL of a likn)
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, { href: newHref, text: newHref });
          return true;
        })
        .run();
      setLinkTooltip(prev => (prev ? { ...prev, href: newHref, text: newHref } : null));
      setIsEditingLink(false);
      return;
    }

    if (linkTooltip.type === 'abstractReference') {
      const title = editAbstractTitle.trim();
      const href = normalizeHttpUrl(editLinkValue);
      if (!title || !href || !isSafeHttpUrl(href)) return;
      const pos = nodePos(linkTooltip.el);
      if (pos === null) return;
      // updates the abstract's attributes in place (when a user changes the title or URL of an abstract reference)
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, { title, href });
          return true;
        })
        .run();
      setLinkTooltip(prev => (prev && prev.type === 'abstractReference' ? { ...prev, title, href } : prev));
      setIsEditingLink(false);
    }
  };

  const saveEditedNctId = () => {
    if (!editor || !linkTooltip || linkTooltip.type !== 'nctReference') return;
    const nctId = normalizeNctId(editLinkValue);
    if (!nctId) return;
    const pos = nodePos(linkTooltip.el);
    if (pos === null) return;
    // updates the NCT reference's nctId attribute in place when a user changes the NCT ID of an existing reference
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(pos, undefined, { nctId });
        return true;
      })
      .run();
    setLinkTooltip(prev => (prev && prev.type === 'nctReference' ? { ...prev, nctId, href: getNctHref(nctId) } : prev));
    setIsEditingLink(false);
  };

  const updatePmidGroupNode = (el: HTMLElement, pmids: string[]) => {
    if (!editor) return;
    const pos = nodePos(el);
    if (pos === null) return;
    if (pmids.length === 0) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .run();
      return;
    }
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(pos, undefined, { pmids: [...pmids] });
        return true;
      })
      .run();
  };

  const addPmidToGroup = () => {
    const pmid = addPmidInput.trim();
    if (!pmid || !pmidGroupTooltip) return;
    if (pmidGroupTooltip.pmids.includes(pmid)) {
      setAddPmidInput('');
      return;
    }
    const newPmids = [...pmidGroupTooltip.pmids, pmid];
    updatePmidGroupNode(pmidGroupTooltip.el, newPmids);
    setAddPmidInput('');
    setPmidGroupTooltip(prev => (prev ? { ...prev, pmids: newPmids } : null));
  };

  const saveEditedPmid = (oldPmid: string) => {
    const newPmid = editingPmidValue.trim();
    if (!newPmid || !pmidGroupTooltip) return;
    const newPmids = pmidGroupTooltip.pmids.map(pmid => (pmid === oldPmid ? newPmid : pmid));
    updatePmidGroupNode(pmidGroupTooltip.el, newPmids);
    setPmidGroupTooltip(prev => (prev ? { ...prev, pmids: newPmids } : null));
    setEditingPmid(null);
    setEditingPmidValue('');
  };

  const removePmidFromGroup = (pmid: string) => {
    if (!pmidGroupTooltip) return;
    const newPmids = pmidGroupTooltip.pmids.filter(value => value !== pmid);
    updatePmidGroupNode(pmidGroupTooltip.el, newPmids);
    if (newPmids.length === 0) {
      clearTooltips();
    } else {
      setPmidGroupTooltip(prev => (prev ? { ...prev, pmids: newPmids } : null));
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderLinkEditContent = () => {
    if (!linkTooltip) return null;

    if (linkTooltip.type === 'abstractReference') {
      return (
        <div className={styles.linkEditFormStack}>
          <input
            className={styles.linkEditInput}
            placeholder="Title"
            value={editAbstractTitle}
            onChange={event => setEditAbstractTitle(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') saveEditedLink();
              if (event.key === 'Escape') setIsEditingLink(false);
            }}
            autoFocus
          />
          <input
            className={styles.linkEditInput}
            placeholder="URL"
            value={editLinkValue}
            onChange={event => setEditLinkValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') saveEditedLink();
              if (event.key === 'Escape') setIsEditingLink(false);
            }}
          />
          <div className={styles.linkEditFormActions}>
            <button type="button" className={styles.linkEditSaveBtn} onMouseDown={event => event.preventDefault()} onClick={saveEditedLink}>
              Save
            </button>
            <button
              type="button"
              className={styles.linkEditCancelBtn}
              onMouseDown={event => event.preventDefault()}
              onClick={() => setIsEditingLink(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (linkTooltip.type === 'nctReference') {
      return (
        <div className={styles.linkEditForm}>
          <input
            className={styles.linkEditInput}
            placeholder="NCT ID"
            value={editLinkValue}
            onChange={event => setEditLinkValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') saveEditedNctId();
              if (event.key === 'Escape') setIsEditingLink(false);
            }}
            autoFocus
          />
          <button type="button" className={styles.linkEditSaveBtn} onMouseDown={event => event.preventDefault()} onClick={saveEditedNctId}>
            Save
          </button>
          <button
            type="button"
            className={styles.linkEditCancelBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => setIsEditingLink(false)}
          >
            Cancel
          </button>
        </div>
      );
    }

    if (linkTooltip.type === 'generic') {
      return (
        <div className={styles.linkEditForm}>
          <input
            className={styles.linkEditInput}
            placeholder="URL"
            value={editLinkValue}
            onChange={event => setEditLinkValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') saveEditedLink();
              if (event.key === 'Escape') setIsEditingLink(false);
            }}
            autoFocus
          />
          <button type="button" className={styles.linkEditSaveBtn} onMouseDown={event => event.preventDefault()} onClick={saveEditedLink}>
            Save
          </button>
          <button
            type="button"
            className={styles.linkEditCancelBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => setIsEditingLink(false)}
          >
            Cancel
          </button>
        </div>
      );
    }

    return null;
  };

  const renderLinkReadContent = () => {
    if (!linkTooltip) return null;

    const startEditing = () => {
      setIsEditingLink(true);
      if (linkTooltip.type === 'abstractReference') {
        setEditAbstractTitle(linkTooltip.title);
        setEditLinkValue(linkTooltip.href);
      } else if (linkTooltip.type === 'nctReference') {
        setEditLinkValue(linkTooltip.nctId);
      } else {
        setEditLinkValue(linkTooltip.href);
      }
    };

    return (
      <div className={styles.linkTooltipContent}>
        <span className={styles.linkUrl} title={linkTooltip.href}>
          {linkTooltip.href}
        </span>
        <div className={styles.linkActions}>
          <button
            type="button"
            data-tooltip="Open link"
            className={styles.linkActionBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => window.open(linkTooltip.href, '_blank', 'noopener,noreferrer')}
          >
            <FiExternalLink />
          </button>
          <button
            type="button"
            data-tooltip={copiedKey === linkTooltip.href ? 'Copied!' : 'Copy link'}
            className={styles.linkActionBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => copyToClipboard(linkTooltip.href, linkTooltip.href)}
          >
            <FiCopy />
          </button>
          {!disabled && (
            <>
              <button
                type="button"
                data-tooltip="Edit link"
                className={styles.linkActionBtn}
                onMouseDown={event => event.preventDefault()}
                onClick={startEditing}
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                data-tooltip="Remove"
                className={classNames(styles.linkActionBtn, styles.linkActionBtnDanger)}
                onMouseDown={event => event.preventDefault()}
                onClick={removeLink}
              >
                <FiX />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPmidRow = (pmid: string) => {
    if (editingPmid === pmid) {
      return (
        <>
          <input
            className={styles.linkEditInput}
            value={editingPmidValue}
            onChange={event => setEditingPmidValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') saveEditedPmid(pmid);
              if (event.key === 'Escape') {
                setEditingPmid(null);
                setEditingPmidValue('');
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className={styles.linkEditSaveBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => saveEditedPmid(pmid)}
          >
            Save
          </button>
          <button
            type="button"
            className={styles.linkEditCancelBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => {
              setEditingPmid(null);
              setEditingPmidValue('');
            }}
          >
            Cancel
          </button>
        </>
      );
    }

    return (
      <>
        <a href={getPubmedArticleHref(pmid)} target="_blank" rel="noopener noreferrer" className={styles.pmidLink}>
          PMID: {pmid}
        </a>
        <div className={styles.linkActions}>
          <button
            type="button"
            data-tooltip="Open link"
            className={styles.linkActionBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => window.open(getPubmedArticleHref(pmid), '_blank', 'noopener,noreferrer')}
          >
            <FiExternalLink />
          </button>
          <button
            type="button"
            data-tooltip={copiedKey === pmid ? 'Copied!' : 'Copy link'}
            className={styles.linkActionBtn}
            onMouseDown={event => event.preventDefault()}
            onClick={() => copyToClipboard(pmid, getPubmedArticleHref(pmid))}
          >
            <FiCopy />
          </button>
          {!disabled && (
            <>
              <button
                type="button"
                data-tooltip="Edit"
                className={styles.linkActionBtn}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  setEditingPmid(pmid);
                  setEditingPmidValue(pmid);
                }}
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                data-tooltip="Remove"
                className={classNames(styles.linkActionBtn, styles.linkActionBtnDanger)}
                onMouseDown={event => event.preventDefault()}
                onClick={() => removePmidFromGroup(pmid)}
              >
                <FiX />
              </button>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {linkTooltip && (
        <div
          ref={linkTooltipRef}
          className={styles.linkTooltip}
          // We cannot use a react Tooltip component because we are using TipTap's renderHTML (TipTap manages the DOM). There is a ReactNodeViewRenderer, but
          // from my search it has some runtime and setup overhead. The tradeoff is that we have to add this styling so that
          // the tooltip appears in the right place relative to the hovered element.
          style={{ top: linkTooltip.el.getBoundingClientRect().bottom, left: linkTooltip.el.getBoundingClientRect().left }}
          onMouseEnter={keepTooltipOpen}
          onMouseMove={keepTooltipOpen}
          onMouseLeave={scheduleHide}
        >
          {isEditingLink ? renderLinkEditContent() : renderLinkReadContent()}
        </div>
      )}

      {pmidGroupTooltip && (
        <div
          ref={pmidGroupTooltipRef}
          className={styles.linkTooltip}
          style={{ top: pmidGroupTooltip.el.getBoundingClientRect().bottom, left: pmidGroupTooltip.el.getBoundingClientRect().left }}
          onMouseEnter={keepTooltipOpen}
          onMouseMove={keepTooltipOpen}
          onMouseLeave={scheduleHide}
        >
          <div className={styles.pmidList}>
            {pmidGroupTooltip.pmids.map(pmid => (
              <div key={pmid} className={styles.pmidRow}>
                {renderPmidRow(pmid)}
              </div>
            ))}
          </div>
          {!disabled && (
            <div className={styles.addPmidForm}>
              <input
                type="text"
                className={styles.refInput}
                placeholder="Add PMID"
                value={addPmidInput}
                onChange={event => setAddPmidInput(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && addPmidToGroup()}
                autoFocus
              />
              <button type="button" className={styles.refInsertBtn} onClick={addPmidToGroup}>
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
