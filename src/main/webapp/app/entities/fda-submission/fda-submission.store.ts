import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IRootStore } from 'app/stores';
import axios, { AxiosResponse } from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const apiUrl = 'api/fda-submissions';
const apiSearchUrl = 'api/_search/fda-submissions';

export class FdaSubmissionStore extends PaginationCrudStore<IFdaSubmission> {
  searchEntities: ICrudSearchAction<IFdaSubmission> = this.readHandler(this.getSearch);
  lookupFdaSubmission = this.readHandler(this.lookupFdaSubmissionGen);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
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

  *getSearch({ query, page, size, sort }) {
    const result = yield axios.get<IFdaSubmission[]>(
      `${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`
    );
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return this.entities;
  }
}

export default FdaSubmissionStore;
