import { IEvidence } from 'app/shared/model/evidence.model';

export interface ILevelOfEvidence {
  id?: number;
  type?: string;
  level?: string;
  evidences?: IEvidence[] | null;
}

export const defaultValue: Readonly<ILevelOfEvidence> = {};
