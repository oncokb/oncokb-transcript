import { mergeAttributes, Node } from '@tiptap/core';
import { getPubmedSearchHref } from 'app/shared/util/pubmed';
import { RichTextInlineNode } from '../richTextSchema';
import { serializeInlineNode } from '../utils';

export const PMID_GROUP_ATTR = 'data-pmid-group';

const parsePmids = (raw: string | null): string[] => {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const PmidGroup = Node.create({
  name: 'pmidGroup',
  group: 'inline',
  inline: true,
  atom: true,

  // Add an attribute so that we can store the PMIDs on the DOM element.
  // We define a parse and a render function to convert between the string representation in the DOM and the array representation in our editor.
  addAttributes() {
    return {
      pmids: {
        default: [] as string[],
        parseHTML: el => parsePmids(el.getAttribute('data-pmids')),
        renderHTML: attrs => ({ 'data-pmids': JSON.stringify(attrs.pmids) }),
      },
    };
  },

  // Tell us how to recognize this node in the DOM. We look for an anchor tag with our custom attribute.
  parseHTML() {
    return [{ tag: `a[${PMID_GROUP_ATTR}]` }];
  },

  // Provide the plain-text representation used when copying/cutting. Without this, ProseMirror's
  // default clipboard serializer emits nothing for atom nodes and the reference is silently dropped.
  renderText({ node }) {
    return serializeInlineNode({ type: node.type.name, attrs: node.attrs } as RichTextInlineNode);
  },

  // You can check the type explanation in HTMLAttributes, but we're returning a tuple
  // where [tagName, attributes, content] corresponds to the HTML element to be rendered.
  renderHTML({ HTMLAttributes }) {
    const pmids = parsePmids(HTMLAttributes['data-pmids']);
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        [PMID_GROUP_ATTR]: '',
        href: getPubmedSearchHref(pmids.join(',')),
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
      `(PMID: ${pmids.join(', ')})`,
    ];
  },
});
