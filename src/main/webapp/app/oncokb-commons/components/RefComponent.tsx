import { getNCBIlink, getNCTlink } from './lib/urls';

export type ParsedRef = {
  prefix?: string;
  content: string;
  link?: string;
  isAbstract?: boolean;
};

export const parseReferences = (content: string, seperatePMIDs = false): ParsedRef[] => {
  const result: ParsedRef[] = [];
  const parsedRef = {} as ParsedRef;

  // Remove the outer "( ... )" wrapper so we can parse the abstract body directly.
  const abstractBody = content
    .trim()
    .replace(/^\(\s*/, '')
    .replace(/\s*\)$/, '');
  // Match an abstract reference only when the content starts with "Abstract" plus an optional colon.
  if (/^abstract:?/i.test(abstractBody)) {
    // Strip the leading "Abstract:" label, preserving everything after it
    const abstractContent = abstractBody.replace(/^abstract:?\s*/i, '');
    // Find where the URL begins so title text and link text can be separated without rewriting URL casing.
    const urlIndex = abstractContent.search(/https?:\/\//i);

    if (urlIndex === -1) {
      parsedRef.content = content;
      return [parsedRef];
    }

    return [
      {
        prefix: 'Abstract: ',
        content: abstractContent.slice(0, urlIndex).trim(),
        // Drop any trailing ")" left from the original wrapper after slicing out the URL.
        link: abstractContent
          .slice(urlIndex)
          .replace(/[\\)]*$/g, '')
          .trim(),
        isAbstract: true,
      },
    ];
  }

  const parts = content.split(/pmid|nct|abstract/i);
  if (parts.length < 2) {
    parsedRef.content = content;
    return [parsedRef];
  }

  const ids = parts[1].match(/[0-9]+/g);

  if (content.toLowerCase().includes('pmid')) {
    if (!ids) {
      parsedRef.content = content;
      return [parsedRef];
    }

    const prefix = 'PMID: ';
    if (seperatePMIDs) {
      ids.forEach(id => {
        result.push({ prefix, content: id, link: getNCBIlink(`/pubmed/${id}`) });
      });
    } else {
      result.push({ prefix, content: ids.join(', '), link: getNCBIlink(`/pubmed/${ids.join(',')}`) });
    }
    return result;
  }

  if (content.toLowerCase().includes('nct') && ids?.[0]) {
    result.push({ prefix: 'NCT', content: ids[0], link: getNCTlink(`/study/NCT${ids[0]}`) });
    return result;
  }

  parsedRef.content = content;
  return [parsedRef];
};
