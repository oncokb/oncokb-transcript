import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/fda-submission-types';

export class FdaSubmissionTypeStore extends CrudStore<IFdaSubmissionType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default FdaSubmissionTypeStore;
