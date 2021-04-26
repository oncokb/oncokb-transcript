import { ITranscript } from 'app/shared/model/transcript.model';
import { UsageSource } from 'app/shared/model/enumerations/usage-source.model';

export interface ITranscriptUsage {
  id?: number;
  source?: UsageSource | null;
  transcript?: ITranscript | null;
}

export const defaultValue: Readonly<ITranscriptUsage> = {};
