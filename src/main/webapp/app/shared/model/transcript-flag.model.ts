import { ITranscript } from 'app/shared/model/transcript.model';

export interface ITranscriptFlag {
  id?: number;
  flag?: string;
  name?: string;
  description?: string;
  transcripts?: ITranscript[] | null;
}

export const defaultValue: Readonly<ITranscriptFlag> = {};
