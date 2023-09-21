import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { ITranscript } from 'app/shared/model/transcript.model';
import { GenomeFragmentType } from 'app/shared/model/enumerations/genome-fragment-type.model';

export interface IGenomeFragment {
  id?: number;
  start?: number | null;
  end?: number | null;
  strand?: number | null;
  type?: GenomeFragmentType | null;
  seqRegion?: ISeqRegion | null;
  transcript?: ITranscript | null;
}

export const defaultValue: Readonly<IGenomeFragment> = {};
