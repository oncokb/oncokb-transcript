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
import { CancerType } from '../model/firebase/firebase.model';
import { ITreatment } from 'app/shared/model/treatment.model';
import _ from 'lodash';

export const getCancerTypeName = (cancerType: ICancerType | CancerType, omitCode = false): string => {
  let name = '';
  if (cancerType) {
    if (cancerType.subtype) {
      name = cancerType.subtype;
      if (!omitCode) {
        name += ` (${cancerType.code})`;
      }
    } else {
      name = cancerType.mainType;
    }
  }
  return name;
};

export const getCancerTypesName = (cancerTypes: ICancerType[] | CancerType[], omitCode = false): string => {
  return cancerTypes.map(cancerType => getCancerTypeName(cancerType, omitCode)).join(', ');
};

export const getCancerTypesNameWithExclusion = (
  cancerTypes: ICancerType[] | CancerType[],
  excludedCancerTypes: ICancerType[] | CancerType[],
  omitCode = false
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

export const getGeneNamesFromAlterations = (alterations: IAlteration[]) => {
  return _.uniq(alterations.map(alteration => alteration.genes.map(gene => gene.hugoSymbol).join('::'))).join(', ');
};

export const getTreatmentName = (treatments: ITreatment[]): string => {
  return treatments.map(treatment => treatment.drugs?.map(drug => drug.name).join(' + ')).join(', ');
};

export const getAlterationName = (alterations: IAlteration[]): string => {
  return alterations.map(alteration => alteration.name).join(', ');
};

export const generateUuid = () => {
  return uuidv4();
};

export function getSectionClassName(theFirst = false) {
  return `${theFirst ? 'pb-3' : 'border-top py-3'}`;
}

export function filterByKeyword(value: string | undefined | null, keyword: string): boolean {
  return value ? value.toLowerCase().includes(keyword.trim()) : false;
}

export const getGenomicLocation = (ensemblGene: IEnsemblGene) => {
  let chromosome = '';
  if (ensemblGene.seqRegion.chromosome !== ensemblGene.seqRegion.name) {
    chromosome = `(${ensemblGene.seqRegion.chromosome})`;
  }
  return `Chromosome ${ensemblGene.seqRegion.name}${chromosome}: ${ensemblGene.start}-${ensemblGene.end} ${
    ensemblGene.strand === 1 ? 'forward' : 'reverse'
  } strand`;
};

export const getPaginationFromSearchParams = (search: string) => {
  const params = new URLSearchParams(search);
  const page = params.get('page');
  let sort = params.get(SORT);
  let order = undefined;
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

export function getUserFullName(user: IUser) {
  let name;
  if (user.firstName && user.lastName) {
    name = `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    name = user.firstName;
  } else {
    name = user.lastName;
  }
  return name;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export async function isPromiseOk(promise: Promise<any>) {
  try {
    await promise;
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

// splits alteration name separated by / into multiple alterations
export function expandAlterationName(name: string) {
  const regex = new RegExp('^([A-Z])\\s*([0-9]+)\\s*([A-Z])\\s*((?:/\\s*[A-Z]\\s*)*)$', 'i');
  const parts = regex.exec(name);

  if (!parts) {
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
export function parseAlterationName(alterationName: string): { alteration: string; excluding: string[]; comment: string; name: string }[] {
  let regex = new RegExp('\\[(.*)\\]', 'i');
  const nameSection = regex.exec(alterationName);
  let name = '';
  if (nameSection?.length > 1) {
    name = nameSection[1];
  }

  const alterationNameWithoutVariantName = alterationName.replace(nameSection?.[0], '');

  regex = new RegExp('({ *excluding[^}]+})', 'i');
  const excludingSection = regex.exec(alterationName);
  let alterationNameWithoutVariantNameAndExcluding = alterationNameWithoutVariantName;
  const excluding: string[] = [];
  if (excludingSection?.length > 1) {
    alterationNameWithoutVariantNameAndExcluding = alterationNameWithoutVariantName.replace(excludingSection[1], '');

    excludingSection[1] = excludingSection[1].slice(1, -1); // remove curly braces
    excludingSection[1] = excludingSection[1].replace(/excluding/i, '');
    const excludedNames = excludingSection[1].split(';');
    for (const ex of excludedNames) {
      excluding.push(...expandAlterationName(ex.trim()));
    }
  }

  const parentheses = [];
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

  const alterationNames = expandAlterationName(parsedAlteration.trim());

  return alterationNames.map(alteration => ({
    alteration,
    excluding,
    comment,
    name,
  }));
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
  return /^-?\d+$/.test(value);
}

export function notNullOrUndefined(val) {
  return val !== null && val !== undefined;
}
