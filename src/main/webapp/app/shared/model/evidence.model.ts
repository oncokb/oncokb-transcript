import { IAssociation } from 'app/shared/model/association.model';
import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';

export interface IEvidence {
  id?: number;
  uuid?: string | null;
  evidenceType?: string;
  knownEffect?: string | null;
  description?: string | null;
  note?: string | null;
  association?: IAssociation | null;
  levelOfEvidences?: ILevelOfEvidence[] | null;
}

export const defaultValue: Readonly<IEvidence> = {};
