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
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

export interface IRootState {
  readonly authentication: AuthenticationState;
  readonly applicationProfile: ApplicationProfileState;
  readonly administration: AdministrationState;
  readonly sequence: SequenceState;
  readonly transcript: TranscriptState;
  readonly transcriptUsage: TranscriptUsageState;
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
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar,
});

export default rootReducer;
