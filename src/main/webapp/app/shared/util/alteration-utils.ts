import { Alteration } from 'app/shared/model/firebase/firebase.model';
import { AlterationAnnotationStatus, AlterationTypeEnum, Gene as ApiGene } from 'app/shared/api/generated/curation';

export type AlterationData = {
  type: AlterationTypeEnum;
  alteration: string;
  name: string;
  consequence: string;
  comment: string;
  excluding: AlterationData[];
  genes?: ApiGene[];
  proteinChange?: string;
  proteinStart?: number;
  proteinEnd?: number;
  refResidues?: string;
  varResidues?: string;
  warning?: string;
  error?: string;
  alterationFieldValueWhileFetching?: string;
};

export function getFullAlterationName(alterationData: AlterationData, includeVariantName = true): string {
  const variantName = includeVariantName && alterationData.name !== alterationData.alteration ? ` [${alterationData.name}]` : '';
  const excluding =
    alterationData.excluding.length > 0 ? ` {excluding ${alterationData.excluding.map(ex => ex.alteration).join(' ; ')}}` : '';
  const comment = alterationData.comment ? ` (${alterationData.comment})` : '';
  return `${alterationData.alteration}${variantName}${excluding}${comment}`;
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

  if (alteration?.alteration !== alterationName) {
    alterationData.alteration = alteration?.alteration ?? '';
  }

  return alterationData;
}

export function convertAlterationDataToAlteration(alterationData: AlterationData): Alteration {
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
