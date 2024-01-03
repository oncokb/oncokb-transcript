import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IEvidence } from 'app/shared/model/evidence.model';
import { ITranscript } from 'app/shared/model/transcript.model';
import { IFlag } from 'app/shared/model/flag.model';
import { ISynonym } from 'app/shared/model/synonym.model';
import { IAlteration } from 'app/shared/model/alteration.model';

export interface IGene {
  id?: number;
  entrezGeneId?: number;
  hugoSymbol?: string;
  hgncId?: string | null;
  ensemblGenes?: IEnsemblGene[] | null;
  evidences?: IEvidence[] | null;
  transcripts?: ITranscript[] | null;
  flags?: IFlag[] | null;
  synonyms?: ISynonym[] | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<IGene> = {};
