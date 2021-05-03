import { combineReducers } from 'redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import authentication, { AuthenticationState } from './authentication';
import applicationProfile, { ApplicationProfileState } from './application-profile';

import administration, { AdministrationState } from 'app/modules/administration/administration.reducer';
// prettier-ignore
import sequence, {
  SequenceState
} from 'app/entities/sequence/sequence.reducer';
// prettier-ignore
import transcript, {
  TranscriptState
} from 'app/entities/transcript/transcript.reducer';
// prettier-ignore
import transcriptUsage, {
  TranscriptUsageState
} from 'app/entities/transcript-usage/transcript-usage.reducer';
// prettier-ignore
import drug, {
  DrugState
} from 'app/entities/drug/drug.reducer';
// prettier-ignore
import drugSynonym, {
  DrugSynonymState
} from 'app/entities/drug-synonym/drug-synonym.reducer';
// prettier-ignore
import info, {
  InfoState
} from 'app/entities/info/info.reducer';
// prettier-ignore
import gene, {
  GeneState
} from 'app/entities/gene/gene.reducer';
// prettier-ignore
import geneAlias, {
  GeneAliasState
} from 'app/entities/gene-alias/gene-alias.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

export interface IRootState {
  readonly authentication: AuthenticationState;
  readonly applicationProfile: ApplicationProfileState;
  readonly administration: AdministrationState;
  readonly sequence: SequenceState;
  readonly transcript: TranscriptState;
  readonly transcriptUsage: TranscriptUsageState;
  readonly drug: DrugState;
  readonly drugSynonym: DrugSynonymState;
  readonly info: InfoState;
  readonly gene: GeneState;
  readonly geneAlias: GeneAliasState;
  /* jhipster-needle-add-reducer-type - JHipster will add reducer type here */
  readonly loadingBar: any;
}

const rootReducer = combineReducers<IRootState>({
  authentication,
  applicationProfile,
  administration,
  sequence,
  transcript,
  transcriptUsage,
  drug,
  drugSynonym,
  info,
  gene,
  geneAlias,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar,
});

export default rootReducer;
