import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/fda-submissions';

export class FdaSubmissionStore extends PaginationCrudStore<IFdaSubmission> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default FdaSubmissionStore;
