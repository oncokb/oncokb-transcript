import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IAlteration } from '../model/alteration.model';
import { IDrug } from '../model/drug.model';
import { v4 as uuidv4 } from 'uuid';
import { IGene } from 'app/shared/model/gene.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';

export const getCancerTypeName = (cancerType: ICancerType): string => {
  let name = '';
  if (cancerType) {
    if (cancerType.subtype) {
      name = `${cancerType.subtype} (${cancerType.code})`;
    } else {
      name = cancerType.mainType;
    }
  }
  return name;
};

export const getGeneName = (gene: IGene): string => {
  return `${gene.entrezGeneId}: ${gene.hugoSymbol}`;
};

export const getTreatmentName = (drugs: IDrug[]): string => {
  return drugs.map(drug => drug.name).join(' + ');
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
