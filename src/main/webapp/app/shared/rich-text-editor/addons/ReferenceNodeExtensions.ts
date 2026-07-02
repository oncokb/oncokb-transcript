import { mergeAttributes, Node } from '@tiptap/core';
import { RichTextAbstractReferenceNode, RichTextGenericLinkNode, RichTextInlineNode, RichTextNctReferenceNode } from '../richTextSchema';
import { normalizeHttpUrl, serializeInlineNode } from '../utils';

// Shared plain-text serializer for the reference atom nodes. ProseMirror's default clipboard
// serializer emits nothing for atom nodes, so without a renderText the reference label is silently
// dropped on copy/cut. Delegating to serializeInlineNode keeps the label format single-sourced.
const renderReferenceText = (node: { type: { name: string }; attrs: Record<string, unknown> }): string =>
  serializeInlineNode({ type: node.type.name, attrs: node.attrs } as RichTextInlineNode);

export const ABSTRACT_REFERENCE_ATTR = 'data-abstract-reference';
export const ABSTRACT_TITLE_ATTR = 'data-title';
export const NCT_REFERENCE_ATTR = 'data-nct-reference';
export const NCT_ID_ATTR = 'data-nct-id';
export const GENERIC_LINK_ATTR = 'data-generic-link';
export const GENERIC_LINK_HREF_ATTR = 'data-href';
export const GENERIC_LINK_TEXT_ATTR = 'data-text';

const REFERENCE_LINK_ATTRS = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

export const normalizeNctId = (rawNctId: string) => {
  const trimmed = rawNctId.trim();
  const nctMatch = trimmed.match(/NCT\s*(\d+)/i);
  return nctMatch ? nctMatch[1] : trimmed.replace(/^NCT/i, '');
};

export const getNctHref = (nctId: string) => `https://clinicaltrials.gov/study/NCT${normalizeNctId(nctId)}`;

export const buildAbstractReferenceNode = (title: string, href: string): RichTextAbstractReferenceNode => ({
  type: 'abstractReference',
  attrs: {
    title,
    href: normalizeHttpUrl(href),
  },
});

export const buildNctReferenceNode = (nctId: string): RichTextNctReferenceNode => ({
  type: 'nctReference',
  attrs: {
    nctId: normalizeNctId(nctId),
  },
});

// Docs for creating custom nodes: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/extension

export const AbstractReference = Node.create({
  name: 'abstractReference',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: element => element.getAttribute(ABSTRACT_TITLE_ATTR) ?? '',
        renderHTML: attributes => ({ [ABSTRACT_TITLE_ATTR]: attributes.title }),
      },
      href: {
        default: '',
        parseHTML: element => element.getAttribute('href') ?? '',
        renderHTML: attributes => ({ href: attributes.href }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `a[${ABSTRACT_REFERENCE_ATTR}]` }];
  },

  renderText({ node }) {
    return renderReferenceText(node);
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        [ABSTRACT_REFERENCE_ATTR]: '',
        ...REFERENCE_LINK_ATTRS,
      }),
      `(Abstract: ${HTMLAttributes[ABSTRACT_TITLE_ATTR] ?? ''})`,
    ];
  },
});

export const buildGenericLinkNode = (text: string, href: string): RichTextGenericLinkNode => ({
  type: 'genericLink',
  attrs: { text, href },
});

export const GenericLink = Node.create({
  name: 'genericLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      href: {
        default: '',
        parseHTML: element => element.getAttribute(GENERIC_LINK_HREF_ATTR) ?? element.getAttribute('href') ?? '',
        renderHTML: attributes => ({ [GENERIC_LINK_HREF_ATTR]: attributes.href }),
      },
      text: {
        default: '',
        parseHTML: element => element.getAttribute(GENERIC_LINK_TEXT_ATTR) ?? element.textContent ?? '',
        renderHTML: attributes => ({ [GENERIC_LINK_TEXT_ATTR]: attributes.text }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `a[${GENERIC_LINK_ATTR}]` }];
  },

  renderText({ node }) {
    return renderReferenceText(node);
  },

  renderHTML({ HTMLAttributes }) {
    const href = HTMLAttributes[GENERIC_LINK_HREF_ATTR] ?? '';
    const text = HTMLAttributes[GENERIC_LINK_TEXT_ATTR] ?? '';
    return ['a', mergeAttributes(HTMLAttributes, { [GENERIC_LINK_ATTR]: '', href, target: '_blank', rel: 'noopener noreferrer' }), text];
  },
});

export const NctReference = Node.create({
  name: 'nctReference',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      nctId: {
        default: '',
        parseHTML: element => normalizeNctId(element.getAttribute(NCT_ID_ATTR) ?? ''),
        renderHTML: attributes => ({ [NCT_ID_ATTR]: normalizeNctId(attributes.nctId) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `a[${NCT_REFERENCE_ATTR}]` }];
  },

  renderText({ node }) {
    return renderReferenceText(node);
  },

  renderHTML({ HTMLAttributes }) {
    const nctId = normalizeNctId(HTMLAttributes[NCT_ID_ATTR] ?? '');
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        [NCT_REFERENCE_ATTR]: '',
        href: getNctHref(nctId),
        ...REFERENCE_LINK_ATTRS,
      }),
      `(NCT${nctId})`,
    ];
  },
});
