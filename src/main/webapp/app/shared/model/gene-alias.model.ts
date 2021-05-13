import { IGene } from 'app/shared/model/gene.model';

export interface IGeneAlias {
  id?: number;
  name?: string | null;
  gene?: IGene | null;
}

export const defaultValue: Readonly<IGeneAlias> = {};
