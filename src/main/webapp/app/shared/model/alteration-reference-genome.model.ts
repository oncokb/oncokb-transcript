import { IAlteration } from 'app/shared/model/alteration.model';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';

export interface IAlterationReferenceGenome {
  id?: number;
  referenceGenome?: ReferenceGenome | null;
  alteration?: IAlteration | null;
}

export const defaultValue: Readonly<IAlterationReferenceGenome> = {};
