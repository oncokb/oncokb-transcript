import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IRootStore } from 'app/stores';
import { action, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import CrudStore from 'app/shared/util/crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const apiUrl = 'api/fda-submissions';

export class FdaSubmissionStore extends CrudStore<IFdaSubmission> {
  lookupFdaSubmission = this.readHandler(this.lookupFdaSubmissionGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
    makeObservable(this, {
      lookupFdaSubmission: action,
    });
  }

  *lookupFdaSubmissionGen(submissionNumber: string) {
    const numbers = submissionNumber.split('/');
    const url = `${apiUrl}/lookup?number=${numbers[0]}${numbers[1] ? `&supplement_number=${numbers[1]}` : ''}`;
    try {
      const result: AxiosResponse<IFdaSubmission> = yield axios.get(url);
      this.reset();
      this.entity = result.data ? result.data : {};
      return this.entity;
    } catch (error) {
      notifyError(error, `Could not find information for ${submissionNumber}.`);
    }
  }
}

export default FdaSubmissionStore;
