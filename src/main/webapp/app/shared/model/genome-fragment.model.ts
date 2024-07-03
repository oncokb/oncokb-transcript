import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { ITranscript } from 'app/shared/model/transcript.model';
import { GenomeFragmentType } from 'app/shared/model/enumerations/genome-fragment-type.model';

export interface IGenomeFragment {
  id?: number;
  start?: number;
  end?: number;
  strand?: number;
  type?: GenomeFragmentType;
  seqRegion?: ISeqRegion | null;
  transcript?: ITranscript | null;
}

export const defaultValue: Readonly<IGenomeFragment> = {};
