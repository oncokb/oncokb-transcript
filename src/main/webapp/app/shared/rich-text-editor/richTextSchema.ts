export type RichTextTextNode = {
  type: 'text';
  text: string;
};

export type RichTextGenericLinkNode = {
  type: 'genericLink';
  attrs: {
    href: string;
    text: string;
  };
};

export type RichTextHardBreakNode = {
  type: 'hardBreak';
};

export type RichTextPmidGroupNode = {
  type: 'pmidGroup';
  attrs: {
    pmids: string[];
  };
};

export type RichTextAbstractReferenceNode = {
  type: 'abstractReference';
  attrs: {
    title: string;
    href: string;
  };
};

export type RichTextNctReferenceNode = {
  type: 'nctReference';
  attrs: {
    nctId: string;
  };
};

// Inline nodes are stuff that appear within a line of text.
export type RichTextInlineNode =
  | RichTextTextNode
  | RichTextHardBreakNode
  | RichTextPmidGroupNode
  | RichTextAbstractReferenceNode
  | RichTextNctReferenceNode
  | RichTextGenericLinkNode;

export type RichTextParagraphNode = {
  type: 'paragraph';
  content?: RichTextInlineNode[];
};

export type RichTextDoc = {
  type: 'doc';
  content?: RichTextParagraphNode[];
};

export type RichTextNode = RichTextDoc | RichTextParagraphNode | RichTextInlineNode;

export type RichTextFragment = RichTextInlineNode[] | RichTextParagraphNode[];

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');

export const isRichTextInlineNode = (value: unknown): value is RichTextInlineNode => {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false;
  }

  switch (value.type) {
    case 'text':
      return typeof value.text === 'string';
    case 'hardBreak':
      return true;
    case 'pmidGroup':
      return isObject(value.attrs) && isStringArray(value.attrs.pmids);
    case 'abstractReference':
      return isObject(value.attrs) && typeof value.attrs.title === 'string' && typeof value.attrs.href === 'string';
    case 'nctReference':
      return isObject(value.attrs) && typeof value.attrs.nctId === 'string';
    case 'genericLink':
      return isObject(value.attrs) && typeof value.attrs.href === 'string' && typeof value.attrs.text === 'string';
    default:
      return false;
  }
};

export const isRichTextParagraphNode = (value: unknown): value is RichTextParagraphNode => {
  if (!isObject(value) || value.type !== 'paragraph') {
    return false;
  }
  if (value.content === undefined) {
    return true;
  }
  // make sure the children of the paragraph node are all valid inline nodes. We don't want to allow invalid structures.
  return Array.isArray(value.content) && value.content.every(isRichTextInlineNode);
};

export const isRichTextDoc = (value: unknown): value is RichTextDoc => {
  if (!isObject(value) || value.type !== 'doc') {
    return false;
  }
  if (value.content === undefined) {
    return true;
  }
  // make sure the children of the doc node are all valid paragraph nodes. We don't want to allow invalid structures.
  return Array.isArray(value.content) && value.content.every(isRichTextParagraphNode);
};

export const parseRichTextDoc = (value: unknown): RichTextDoc | undefined => {
  if (isRichTextDoc(value)) {
    return value;
  }
  return undefined;
};
