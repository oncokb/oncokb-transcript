import { ITranscript } from 'app/shared/model/transcript.model';
import { SequenceType } from 'app/shared/model/enumerations/sequence-type.model';

export interface ISequence {
  id: number;
  sequenceType: SequenceType;
  sequence: string;
  transcript: ITranscript | null;
}
