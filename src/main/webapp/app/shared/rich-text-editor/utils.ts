import { buildPastedRichTextContent } from './addons/referenceParsing';
import { RichTextDoc, RichTextInlineNode, RichTextNode, RichTextParagraphNode, RichTextTextNode } from './richTextSchema';

const isInlineNode = (node: RichTextNode): node is RichTextInlineNode =>
  node.type === 'text' ||
  node.type === 'hardBreak' ||
  node.type === 'pmidGroup' ||
  node.type === 'abstractReference' ||
  node.type === 'nctReference' ||
  node.type === 'genericLink';

const textNode = (text: string): RichTextTextNode => ({ type: 'text', text });

export const plainTextToTipTapDoc = (text: string): RichTextDoc => {
  if (!text) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  return {
    type: 'doc',
    content: text.split(/\r?\n/).map(line => ({
      type: 'paragraph',
      content: line ? [textNode(line)] : [],
    })),
  };
};

export const textToTipTapDocWithReferences = (text: string): RichTextDoc => {
  if (!text) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const content = buildPastedRichTextContent(text);
  if (!content.length) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  if (content[0].type === 'paragraph') {
    return { type: 'doc', content: content as RichTextParagraphNode[] };
  }

  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: content as RichTextInlineNode[] }],
  };
};

export const serializeInlineNode = (node: RichTextInlineNode): string => {
  if (node.type === 'text') {
    return node.text;
  }

  if (node.type === 'hardBreak') {
    return '\n';
  }

  if (node.type === 'pmidGroup') {
    const pmids = Array.isArray(node.attrs?.pmids) ? node.attrs?.pmids : [];
    return `(PMID: ${pmids.join(', ')})`;
  }

  if (node.type === 'abstractReference') {
    const title = node.attrs?.title ?? '';
    const href = node.attrs?.href ?? '';
    return `(Abstract: ${title}${href ? ` ${href}` : ''})`;
  }

  if (node.type === 'nctReference') {
    return `(NCT${node.attrs?.nctId ?? ''})`;
  }

  if (node.type === 'genericLink') {
    return node.attrs?.text || node.attrs?.href || '';
  }

  return '';
};

const serializeChildren = (node: RichTextDoc | Exclude<RichTextNode, RichTextInlineNode>): string => {
  if (!node.content?.length) {
    return '';
  }

  if (node.content.every(isInlineNode)) {
    return node.content.map(serializeInlineNode).join('');
  }

  return node.content.map(tipTapJsonToPlainText).filter(Boolean).join('\n');
};

export const tipTapJsonToPlainText = (node: RichTextNode | undefined): string => {
  if (!node) {
    return '';
  }

  if (isInlineNode(node)) {
    return serializeInlineNode(node);
  }

  if (node.type === 'doc') {
    return node.content?.map(tipTapJsonToPlainText).join('\n') ?? '';
  }

  return serializeChildren(node);
};

export const normalizeHttpUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isSafeHttpUrl = (rawUrl: string): boolean => {
  try {
    const url = new URL(normalizeHttpUrl(rawUrl));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
