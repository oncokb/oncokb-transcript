import { IFlag } from 'app/shared/model/flag.model';
import { IGene } from 'app/shared/model/gene.model';
import { ITranscript } from 'app/shared/model/transcript.model';
import { IConsequence } from 'app/shared/model/consequence.model';
import { IAssociation } from 'app/shared/model/association.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface IAlteration {
  id: number;
  type: AlterationType;
  name: string;
  alteration: string;
  proteinChange: string;
  start: number | null;
  end: number | null;
  refResidues: string | null;
  variantResidues: string | null;
  flags: IFlag[] | null;
  genes: IGene[] | null;
  transcripts: ITranscript[] | null;
  consequence: IConsequence | null;
  associations: IAssociation[] | null;
}
