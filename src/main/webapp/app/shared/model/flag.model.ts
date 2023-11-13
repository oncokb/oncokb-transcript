import { IDrug } from 'app/shared/model/drug.model';
import { IGene } from 'app/shared/model/gene.model';
import { ITranscript } from 'app/shared/model/transcript.model';

export interface IFlag {
  id?: number;
  type?: string;
  flag?: string;
  name?: string;
  description?: string;
  drugs?: IDrug[] | null;
  genes?: IGene[] | null;
  transcripts?: ITranscript[] | null;
}

export const defaultValue: Readonly<IFlag> = {};
