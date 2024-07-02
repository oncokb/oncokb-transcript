import { IEvidence } from 'app/shared/model/evidence.model';

// CrudStore cannot use an interface
export type ILevelOfEvidence = {
  id: number;
  type: string;
  level: string;
  description: string;
  htmlDescription: string;
  color: string;
  evidences: IEvidence[] | null;
};
