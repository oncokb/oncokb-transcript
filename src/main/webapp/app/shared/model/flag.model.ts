import { ITranscript } from 'app/shared/model/transcript.model';
import { IGene } from 'app/shared/model/gene.model';

export interface IFlag {
  id?: number;
  type?: string;
  flag?: string;
  name?: string;
  description?: string;
  transcripts?: ITranscript[] | null;
  genes?: IGene[] | null;
}

export const defaultValue: Readonly<IFlag> = {};
