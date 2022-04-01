import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { ISequence } from 'app/shared/model/sequence.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';

export interface ITranscript {
  id?: number;
  ensemblTranscriptId?: string | null;
  canonical?: boolean;
  ensemblProteinId?: string | null;
  referenceSequenceId?: string | null;
  description?: string | null;
  fragments?: IGenomeFragment[] | null;
  sequences?: ISequence[] | null;
  ensemblGene?: IEnsemblGene | null;
}

export const defaultValue: Readonly<ITranscript> = {
  canonical: false,
};
