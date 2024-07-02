import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';

// CrudStore cannot use an interface
export type IAlleleState = {
  id: number;
  name: string;
  genomicIndicators: IGenomicIndicator[] | null;
};
