import React from 'react';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IAlteration } from '../model/alteration.model';
import { v4 as uuidv4 } from 'uuid';
import { IGene } from 'app/shared/model/gene.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from '../button/EntityActionButton';
import { SORT } from './pagination.constants';
import { PaginationState } from '../table/OncoKBAsyncTable';
import { IUser } from '../model/user.model';
import { Alteration, CancerType, Flag } from '../model/firebase/firebase.model';
import _ from 'lodash';
import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import { IDrug } from 'app/shared/model/drug.model';
import { IRule } from 'app/shared/model/rule.model';
import { INTEGER_REGEX, REFERENCE_LINK_REGEX, SINGLE_NUCLEOTIDE_POS_REGEX, UUID_REGEX } from 'app/config/constants/regex';
import { AlterationAnnotationStatus, AlterationTypeEnum, ProteinExonDTO } from 'app/shared/api/generated/curation';
import { IQueryParams } from './jhipster-types';
import InfoIcon from '../icons/InfoIcon';
import { AlterationData } from '../modal/NewAddMutationModal';
import { IFlag } from '../model/flag.model';

export const getCancerTypeName = (cancerType: ICancerType | CancerType, omitCode = false): string => {
  if (!cancerType) return '';
  if (!cancerType.subtype) return cancerType.mainType ?? '';

  let name = cancerType.subtype;
  if (!omitCode) name += ` (${cancerType.code})`;
  return name;
};

export const getCancerTypesName = (cancerTypes: (ICancerType | CancerType)[], omitCode = false, separator = ', '): string => {
  return cancerTypes.map(cancerType => getCancerTypeName(cancerType, omitCode)).join(separator);
};

export const getCancerTypesNameWithExclusion = (
  cancerTypes: ICancerType[] | CancerType[],
  excludedCancerTypes: ICancerType[] | CancerType[],
  omitCode = false,
): string => {
  let name = getCancerTypesName(cancerTypes, omitCode);
  if (excludedCancerTypes.length > 0) {
    name += ` {excluding ${getCancerTypesName(excludedCancerTypes, omitCode)}}`;
  }
  return name;
};

export const getGeneName = (gene: IGene): string => {
  return `${gene.entrezGeneId}: ${gene.hugoSymbol}`;
};

export const getGeneNameFromAlteration = (alteration: IAlteration) => {
  return alteration.genes?.map(gene => gene.hugoSymbol).join('::') ?? '';
};

export const getGeneNamesFromAlterations = (alterations: IAlteration[]) => {
  return _.uniq(alterations.map(alteration => getGeneNameFromAlteration(alteration)));
};

export const getGeneNamesStringFromAlterations = (alterations: IAlteration[]) => {
  return getGeneNamesFromAlterations(alterations).join(', ');
};

export const getTreatmentName = (drugs: IDrug[], rule?: IRule): string => {
  if (rule == null) {
    return drugs.map(drug => drug.name).join(', ');
  } else {
    const drugMap = drugs.reduce((map, next) => {
      map[next.id.toString()] = next;
      return map;
    }, {});
    return (
      rule.rule
        ?.split(',')
        .map(treatment => {
          return treatment
            .split('+')
            .map(drugId => drugMap[drugId.trim()]?.name)
            .join(' + ');
        })
        .join(', ') ?? ''
    );
  }
};

export const getAlterationName = (alterations: IAlteration[]): string => {
  return alterations
    .map(alteration => alteration.name)
    .sort()
    .join(', ');
};

export const generateUuid = () => {
  return uuidv4();
};

export function getSectionClassName(theFirst = false) {
  return `${theFirst ? 'pb-3' : 'border-top py-3'}`;
}

export function filterByKeyword(value: string | undefined | null, keyword: string, splitKeywords = false): boolean {
  let keywords = [keyword];
  if (splitKeywords) {
    keywords = keyword.split(' ');
  }
  return keywords.filter(k => value?.toLowerCase().includes(k.trim())).length === keywords.length;
}

export const getGenomicLocation = (ensemblGene: IEnsemblGene) => {
  let chromosome = '';
  if (ensemblGene.seqRegion?.chromosome !== ensemblGene.seqRegion?.name) {
    chromosome = `(${ensemblGene.seqRegion?.chromosome})`;
  }
  return `Chromosome ${ensemblGene.seqRegion?.name}${chromosome}: ${ensemblGene.start}-${ensemblGene.end} ${
    ensemblGene.strand === 1 ? 'forward' : 'reverse'
  } strand`;
};

export const getPaginationFromSearchParams = (search: string) => {
  const params = new URLSearchParams(search);
  const page = params.get('page');
  let sort = params.get(SORT);
  let order: string | undefined = undefined;
  if (sort) {
    const sortSplit = sort.split(',');
    sort = sortSplit[0];
    order = sortSplit[1];
  }
  if (page && sort && order) {
    return {
      activePage: parseInt(page, 10),
      sort,
      order,
    } as PaginationState<any>;
  }
  return undefined;
};

export const getEntityTableActionsColumn = (entityType: ENTITY_TYPE) => {
  const actionsColumn = {
    id: 'actions',
    Header: 'Actions',
    Cell(cell: { original }) {
      const entityId = entityType === ENTITY_TYPE.USER ? cell.original.login : cell.original.id;
      return (
        <div>
          <EntityActionButton
            color="info"
            size="sm"
            entityId={entityId}
            entityType={entityType}
            entityAction={ENTITY_ACTION.VIEW}
            showText={false}
          />
          <EntityActionButton
            color="primary"
            size="sm"
            entityId={entityId}
            entityType={entityType}
            entityAction={ENTITY_ACTION.EDIT}
            showText={false}
          />
          <EntityActionButton
            color="danger"
            size="sm"
            entityId={entityId}
            entityType={entityType}
            entityAction={ENTITY_ACTION.DELETE}
            showText={false}
          />
        </div>
      );
    },
    minWidth: 150,
    maxWidth: 150,
    sortable: false,
  };
  return actionsColumn;
};

export function getUserFullName(user: IUser | undefined) {
  if (!user) {
    return '';
  }
  let name: string;
  if (user.firstName && user.lastName) {
    name = `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    name = user.firstName;
  } else {
    name = user.lastName;
  }
  return name;
}

export function formatDate(date: Date, dayOnly?: boolean) {
  const timeFormat = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  } as any;
  if (!dayOnly) {
    timeFormat.hour = '2-digit';
    timeFormat.minute = '2-digit';
    timeFormat.hour12 = true;
  }
  return new Intl.DateTimeFormat('en-US', timeFormat).format(date);
}

export async function isPromiseOk(promise: Promise<any>) {
  try {
    await promise;
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

// splits alteration name separated by '/' or ',' into multiple alterations

export function expandAlterationName(name: string, splitStringMutations = false) {
  const regex = new RegExp('^([A-Z])\\s*([0-9]+)\\s*([A-Z])\\s*((?:/\\s*[A-Z]\\s*)*)$', 'i');
  const parts = regex.exec(name);

  if (!parts) {
    if (splitStringMutations && name.includes(',')) {
      return name.split(',').map(part => part.trim());
    }
    return [name];
  }

  const alterations: string[] = [];
  const firstPart = parts[1] + parts[2];
  alterations.push(firstPart + parts[3]);
  const rest = parts[4].substring(1);
  const alleles = rest ? rest.split('/') : [];
  for (const allele of alleles) {
    alterations.push(firstPart + allele.trim());
  }
  return alterations;
}

// splits alteration name into alteration, excluding and comment
// if alteration is separated by /, applies the same excluding and comment to separated alterations
export function parseAlterationName(
  alterationName: string,
  splitStringMutation = false,
): { alteration: string; excluding: string[]; comment: string; name: string }[] {
  let regex = new RegExp('\\[(.*)\\]', 'i');
  const nameSection = regex.exec(alterationName);
  let name = '';
  if (nameSection && nameSection.length > 1) {
    name = nameSection[1];
  }

  const alterationNameWithoutVariantName = alterationName.replace(nameSection?.[0] ?? '', '');

  regex = new RegExp('({ *excluding[^}]+})', 'i');
  const excludingSection = regex.exec(alterationName);
  let alterationNameWithoutVariantNameAndExcluding = alterationNameWithoutVariantName;
  const excluding: string[] = [];
  if (excludingSection && excludingSection?.length > 1) {
    alterationNameWithoutVariantNameAndExcluding = alterationNameWithoutVariantName.replace(excludingSection[1], '');

    excludingSection[1] = excludingSection[1].slice(1, -1); // remove curly braces
    excludingSection[1] = excludingSection[1].replace(/excluding/i, '');
    const excludedNames = excludingSection[1].split(';');
    for (const ex of excludedNames) {
      excluding.push(...expandAlterationName(ex.trim(), splitStringMutation));
    }
  }

  const parentheses: string[] = [];
  let comment = '';
  for (const c of alterationName) {
    if (c === '(') {
      if (parentheses.length > 0) {
        comment += c;
      }
      parentheses.push(c);
    } else if (c === ')') {
      parentheses.pop();
      if (parentheses.length > 0) {
        comment += c;
      }
    } else if (parentheses.length > 0) {
      comment += c;
    }

    if (parentheses.length === 0 && comment.length > 0) {
      break;
    }
  }

  const parsedAlteration = alterationNameWithoutVariantNameAndExcluding.replace('(' + comment + ')', '');

  const alterationNames = expandAlterationName(parsedAlteration.trim(), splitStringMutation);

  return alterationNames.map(alteration => ({
    alteration,
    excluding,
    comment,
    name,
  }));
}

export function getFullAlterationName(alterationData: AlterationData, includeVariantName = true) {
  const variantName = includeVariantName && alterationData.name !== alterationData.alteration ? alterationData.name : '';
  const excluding = alterationData.excluding.length > 0 ? alterationData.excluding.map(ex => ex.alteration) : [];
  const comment = alterationData.comment ? alterationData.comment : '';
  return buildAlterationName(alterationData.alteration, variantName, excluding, comment);
}

export function convertEntityStatusAlterationToAlterationData(
  entityStatusAlteration: AlterationAnnotationStatus,
  alterationName: string,
  excluding: AlterationData[],
  comment: string,
  variantName?: string,
): AlterationData {
  const alteration = entityStatusAlteration.entity;
  const alterationData: AlterationData = {
    type: alteration?.type ?? AlterationTypeEnum.Unknown,
    alteration: alterationName,
    name: (variantName || alteration?.name) ?? '',
    consequence: alteration?.consequence?.name ?? '',
    comment,
    excluding,
    genes: alteration?.genes,
    proteinChange: alteration?.proteinChange,
    proteinStart: alteration?.start,
    proteinEnd: alteration?.end,
    refResidues: alteration?.refResidues,
    varResidues: alteration?.variantResidues,
    warning: entityStatusAlteration.warning ? entityStatusAlteration.message : undefined,
    error: entityStatusAlteration.error ? entityStatusAlteration.message : undefined,
  };

  // if the backend's response is different from the frontend response, set them equal to each other.
  if (alteration?.alteration !== alterationName) {
    alterationData.alteration = alteration?.alteration ?? '';
  }

  return alterationData;
}

export function convertAlterationDataToAlteration(alterationData: AlterationData) {
  const alteration = new Alteration();
  alteration.type = alterationData.type;
  alteration.alteration = alterationData.alteration;
  alteration.name = getFullAlterationName(alterationData);
  alteration.proteinChange = alterationData.proteinChange || '';
  alteration.proteinStart = alterationData.proteinStart || -1;
  alteration.proteinEnd = alterationData.proteinEnd || -1;
  alteration.refResidues = alterationData.refResidues || '';
  alteration.varResidues = alterationData.varResidues || '';
  alteration.consequence = alterationData.consequence;
  alteration.comment = alterationData.comment;
  alteration.excluding = alterationData.excluding.map(ex => convertAlterationDataToAlteration(ex));
  alteration.genes = alterationData.genes || [];
  return alteration;
}

export function convertAlterationToAlterationData(alteration: Alteration): AlterationData {
  const { name: variantName } = parseAlterationName(alteration.name)[0];

  return {
    type: alteration.type,
    alteration: alteration.alteration,
    name: variantName || alteration.alteration,
    consequence: alteration.consequence,
    comment: alteration.comment,
    excluding: alteration.excluding?.map(ex => convertAlterationToAlterationData(ex)) || [],
    genes: alteration?.genes || [],
    proteinChange: alteration?.proteinChange,
    proteinStart: alteration?.proteinStart === -1 ? undefined : alteration?.proteinStart,
    proteinEnd: alteration?.proteinEnd === -1 ? undefined : alteration?.proteinEnd,
    refResidues: alteration?.refResidues,
    varResidues: alteration?.varResidues,
  };
}

export function convertIFlagToFlag(flagEntity: IFlag | Omit<IFlag, 'id'>): Flag {
  return {
    flag: flagEntity.flag,
    type: flagEntity.type,
  };
}

export function buildAlterationName(alteration: string, name = '', excluding = [] as string[], comment = '') {
  if (name) {
    name = ` [${name}]`;
  }
  let exclusionString = '';
  if (excluding.length > 0) {
    exclusionString = ` {excluding ${excluding.join('; ')}}`;
  }
  if (comment) {
    comment = ` (${comment})`;
  }
  return `${alteration}${name}${exclusionString}${comment}`;
}

export function getAlterationNameComponent(alterationName: string, comment?: string) {
  return (
    <>
      <span>{alterationName}</span>
      {comment && <InfoIcon className="ms-1" overlay={comment} />}
    </>
  );
}

export function findIndexOfFirstCapital(str: string) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] >= 'A' && str[i] <= 'Z') {
      return i;
    }
  }
  return -1;
}

export function isNumeric(value: string) {
  return INTEGER_REGEX.test(value);
}

/**
 * @param hexColor A string representing a hex color
 * @param alpha A decimal in the range [0.0, 1.0]
 * @returns A string representing a hex color with transparency
 */
export function getHexColorWithAlpha(hexColor: string, alpha: number) {
  const alphaHex = `0${Math.round(255 * alpha).toString(16)}`.slice(-2).toUpperCase();
  return `${hexColor}${alphaHex}`;
}

export function extractPositionFromSingleNucleotideAlteration(alteration: string | undefined) {
  const regex = SINGLE_NUCLEOTIDE_POS_REGEX;
  const match = regex.exec(alteration ?? '');
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

export function parseTextForReferences(text: string) {
  let content: Array<ParsedRef> = [];

  const parts = text.split(REFERENCE_LINK_REGEX);
  parts.forEach((part: string) => {
    if (part.match(REFERENCE_LINK_REGEX)) {
      const parsedRef = parseReferences(part, true);
      parsedRef.filter(ref => ref.link).forEach(ref => content.push(ref));
    }
  });

  content = _.uniqBy(content, 'content');
  return content;
}

export function getReferenceFullName(reference: ParsedRef) {
  if (!reference.prefix) {
    return reference.content;
  }
  return `${reference.prefix}${reference.content}`;
}

export function isEqualIgnoreCase(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

export function getExonRanges(exons: ProteinExonDTO[]) {
  const exonRanges: string[] = [];
  let startExon = 0;
  let endExon = 0;
  for (let i = 0; i < exons.length; i++) {
    const exon = exons[i];
    if (startExon === 0 && exon?.exon) {
      startExon = endExon = exon?.exon;
    }

    const secondExon = exons[i + 1]?.exon;

    if (i + 1 === exons.length || (secondExon && secondExon - 1 !== endExon)) {
      if (startExon === endExon) {
        exonRanges.push(startExon.toString());
      } else {
        exonRanges.push(`${startExon}~${endExon}`);
      }
      startExon = endExon = 0;
    } else {
      endExon++;
    }
  }
  return exonRanges;
}

export function isUuid(str: string) {
  return UUID_REGEX.test(str);
}

export const parseSort = (sort: IQueryParams['sort']) => {
  return sort?.map(sortMethod => `&sort=${sortMethod}`).join('');
};

export const hasValue = <T,>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};
