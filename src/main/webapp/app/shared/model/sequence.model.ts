import { ITranscript } from 'app/shared/model/transcript.model';
import { SequenceType } from 'app/shared/model/enumerations/sequence-type.model';

export interface ISequence {
  id?: number;
  sequenceType?: SequenceType | null;
  sequence?: string | null;
  transcript?: ITranscript | null;
}

export const defaultValue: Readonly<ISequence> = {};
