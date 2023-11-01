import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class LevelOfEvidenceStore extends CrudStore<ILevelOfEvidence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.LEVEL_OF_EVIDENCE));
  }
}

export default LevelOfEvidenceStore;
