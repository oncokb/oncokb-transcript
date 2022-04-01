import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/fda-submissions';

export class FdaSubmissionStore extends CrudStore<IFdaSubmission> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default FdaSubmissionStore;
