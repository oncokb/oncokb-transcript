import { ISequence } from 'app/shared/model/sequence.model';
import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { IFlag } from 'app/shared/model/flag.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IGene } from 'app/shared/model/gene.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';

export interface ITranscript {
  id?: number;
  referenceGenome?: ReferenceGenome | null;
  ensemblTranscriptId?: string | null;
  canonical?: boolean;
  ensemblProteinId?: string | null;
  referenceSequenceId?: string | null;
  description?: string | null;
  sequences?: ISequence[] | null;
  fragments?: IGenomeFragment[] | null;
  flags?: IFlag[] | null;
  ensemblGene?: IEnsemblGene | null;
  gene?: IGene | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<ITranscript> = {
  canonical: false,
};
