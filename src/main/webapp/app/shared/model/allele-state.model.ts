import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';

export interface IAlleleState {
  id?: number;
  name?: string;
  genomicIndicators?: IGenomicIndicator[] | null;
}

export const defaultValue: Readonly<IAlleleState> = {};
