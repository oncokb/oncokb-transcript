import { getNCBIlink, getNCTlink } from './lib/urls';

export type ParsedRef = {
  prefix?: string;
  content: string;
  link?: string;
  isAbstract?: boolean;
};

export const parseReferences = (content: string, seperatePMIDs = false): ParsedRef[] => {
  const result: ParsedRef[] = [];
  let parsedRef = {} as ParsedRef;
  const parts = content.split(/pmid|nct|abstract/i);
  if (parts.length < 2) {
    parsedRef.content = content;
    return [parsedRef];
  }

  // Slicing from index 1 to end to rejoin the abstract title and links
  // when there's the case that they also contain the string 'Abstract'
  // Example :
  //     (Abstract: Fakih et al. Abstract# 3003, ASCO 2019.)
  const abstractParts = parts
    .slice(1)
    .join('Abstract')
    .split(/(?=http)/i);
  const isAbstract = !(abstractParts.length < 2);
  let abstract = '';
  const ids = parts[1].match(/[0-9]+/g);
  let prefix: string | undefined;
  let link: string | undefined;

  if (isAbstract) {
    abstract = abstractParts[0].replace(/^[:\s]*/g, '').trim();
    link = abstractParts[1].replace(/[\\)]*$/g, '').trim();
    prefix = 'Abstract: ';
    parsedRef = { prefix, content: abstract, link, isAbstract };
    return [parsedRef];
  } else {
    if (!ids) {
      parsedRef.content = content;
      return [parsedRef];
    }

    if (content.toLowerCase().includes('pmid')) {
      prefix = 'PMID: ';
      if (seperatePMIDs) {
        ids.forEach(id => {
          result.push({ prefix, content: id, link: getNCBIlink(`/pubmed/${id}`) });
        });
      } else {
        result.push({ prefix, content: ids.join(', '), link: getNCBIlink(`/pubmed/${ids.join(',')}`) });
      }
    } else if (content.toLowerCase().includes('nct')) {
      if (ids[0]) {
        result.push({ prefix, content: ids[0], link: getNCTlink(`/study/${prefix}${ids[0]}`) });
      }
    }
  }
  return result;
};
