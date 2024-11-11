import { IFeatureFlag } from 'app/shared/model/feature-flag.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class FeatureFlagStore extends CrudStore<IFeatureFlag> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.FEATURE_FLAG));
  }
}

export default FeatureFlagStore;
