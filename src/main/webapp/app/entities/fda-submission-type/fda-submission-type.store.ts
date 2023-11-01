import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class FdaSubmissionTypeStore extends CrudStore<IFdaSubmissionType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.FDA_SUBMISSION_TYPE));
  }
}

export default FdaSubmissionTypeStore;
