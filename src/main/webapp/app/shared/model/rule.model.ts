import { IAssociation } from 'app/shared/model/association.model';

export interface IRule {
  id?: number;
  entity?: string;
  rule?: string | null;
  name?: string | null;
  association?: IAssociation | null;
}

export const defaultValue: Readonly<IRule> = {};
