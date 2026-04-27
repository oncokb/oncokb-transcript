import { REFERENCE_LINK_REGEX } from 'app/config/constants/regex';
import { parseReferences } from 'app/oncokb-commons/components/RefComponent';
import { RichTextPasteHandler } from '../RichTextEditor';
import { RichTextFragment, RichTextInlineNode, RichTextTextNode } from '../richTextSchema';
import { buildAbstractReferenceNode, buildGenericLinkNode, buildNctReferenceNode } from './ReferenceNodeExtensions';

const PASTE_TOKEN_REGEX = new RegExp(`${REFERENCE_LINK_REGEX.source}|(https?:\\/\\/[^\\s<>"']+)`, 'gi');

const textNode = (text: string): RichTextTextNode => ({ type: 'text', text });

const resolveMatchedNode = (refRaw: string | undefined, urlRaw: string | undefined): RichTextInlineNode | null => {
  if (urlRaw) {
    return buildGenericLinkNode(urlRaw, urlRaw);
  }
  if (!refRaw) {
    return null;
  }
  if (refRaw.toLowerCase().includes('pmid')) {
    const pmids = refRaw.match(/\d+/g) ?? [];
    return pmids.length ? { type: 'pmidGroup', attrs: { pmids } } : textNode(refRaw);
  }
  const ref = parseReferences(refRaw)[0];
  if (!ref?.link) {
    return textNode(refRaw);
  }
  if (ref.isAbstract) {
    return buildAbstractReferenceNode(ref.content || refRaw, ref.link);
  }
  if ((ref.prefix ?? '').toUpperCase() === 'NCT') {
    return buildNctReferenceNode(ref.content ?? '');
  }
  return buildGenericLinkNode(`(${ref.prefix ?? ''}${ref.content})`, ref.link);
};

export const parsePastedInlineContent = (text: string): RichTextInlineNode[] => {
  const nodes: RichTextInlineNode[] = [];
  PASTE_TOKEN_REGEX.lastIndex = 0;
  let lastIndex = 0;
  let match = PASTE_TOKEN_REGEX.exec(text);

  while (match !== null) {
    // Between matches, we want to make sure to save the plain text
    // ie: "Text here (PMID:12345)" would push "Text here " as a text node
    if (match.index > lastIndex) {
      nodes.push(textNode(text.slice(lastIndex, match.index)));
    }

    const refRaw = match[1];
    const urlRaw = match[2];

    const node = resolveMatchedNode(refRaw, urlRaw);
    if (node) nodes.push(node);

    lastIndex = match.index + match[0].length;
    match = PASTE_TOKEN_REGEX.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(textNode(text.slice(lastIndex)));
  }

  return nodes;
};

export const buildPastedRichTextContent = (text: string): RichTextFragment => {
  const lines = text.split(/\r?\n/);
  if (lines.length === 1) {
    return parsePastedInlineContent(lines[0]);
  }
  return lines.map(line => ({ type: 'paragraph', content: parsePastedInlineContent(line) }));
};

export const referencePasteHandler: RichTextPasteHandler = (text, editor) => {
  const hasRefs = /pmid|nct|abstract/i.test(text);
  const hasUrls = /https?:\/\//i.test(text);
  if (!hasRefs && !hasUrls) return false;
  editor.commands.insertContent(buildPastedRichTextContent(text));
  return true;
};
