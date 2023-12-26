import { IAssociation } from 'app/shared/model/association.model';
import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';
import { IGene } from 'app/shared/model/gene.model';

export interface IEvidence {
  id?: number;
  uuid?: string | null;
  evidenceType?: string;
  knownEffect?: string | null;
  description?: string | null;
  note?: string | null;
  association?: IAssociation | null;
  levelOfEvidences?: ILevelOfEvidence[] | null;
  gene?: IGene | null;
}

export const defaultValue: Readonly<IEvidence> = {};
