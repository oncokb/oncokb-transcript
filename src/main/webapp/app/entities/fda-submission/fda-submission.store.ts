import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IRootStore } from 'app/stores';
import { action, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/fda-submissions';

export class FdaSubmissionStore extends PaginationCrudStore<IFdaSubmission> {
  lookupFdaSubmission = this.readHandler(this.lookupFdaSubmissionGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
    makeObservable(this, {
      lookupFdaSubmission: action,
    });
  }

  *lookupFdaSubmissionGen(submissionNumber: string) {
    const numbers = submissionNumber.split('/');
    const url = `${apiUrl}/lookup?number=${numbers[0]}${numbers[1] ? `&supplementNumber=${numbers[1]}` : ''}`;
    try {
      const result: AxiosResponse<IFdaSubmission> = yield axios.get(url);
      this.reset();
      this.entity = result.data || {};
      return this.entity;
    } catch (error) {
      notifyError(error, `Could not find information for ${submissionNumber}.`);
    }
  }
}

export default FdaSubmissionStore;
