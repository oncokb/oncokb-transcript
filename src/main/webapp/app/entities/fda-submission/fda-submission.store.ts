import { IRootStore } from 'app/stores';
import axios, { AxiosResponse } from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { fdaSubmissionClient } from 'app/shared/api/clients';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

const apiUrl = getEntityResourcePath(ENTITY_TYPE.FDA_SUBMISSION);

export class FdaSubmissionStore extends PaginationCrudStore<IFdaSubmission> {
  lookupFdaSubmission = this.readHandler(this.lookupFdaSubmissionGen);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.FDA_SUBMISSION);
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

  *getFdaSubmissionsByCDx({ cdxId }) {
    try {
      if (cdxId) {
        const result = yield fdaSubmissionClient.findFdaSubmissionsByCompanionDiagnosticDevice(cdxId);
        return result.data;
      }
      return [];
    } catch (error) {
      notifyError(error);
    }
  }
}

export default FdaSubmissionStore;
