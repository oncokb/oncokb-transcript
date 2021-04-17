import { ITranscriptUsage } from 'app/shared/model/transcript-usage.model';
import { ISequence } from 'app/shared/model/sequence.model';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';

export interface ITranscript {
  id?: number;
  entrezGeneId?: number;
  hugoSymbol?: string;
  referenceGenome?: ReferenceGenome;
  ensemblTranscriptId?: string | null;
  ensemblProteinId?: string | null;
  referenceSequenceId?: string | null;
  description?: string | null;
  transcriptUsages?: ITranscriptUsage[] | null;
  sequences?: ISequence[] | null;
}

export const defaultValue: Readonly<ITranscript> = {};
