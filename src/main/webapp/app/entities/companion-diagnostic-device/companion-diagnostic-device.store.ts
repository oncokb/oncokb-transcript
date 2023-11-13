import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class CompanionDiagnosticDeviceStore extends CrudStore<ICompanionDiagnosticDevice> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE));
  }
}

export default CompanionDiagnosticDeviceStore;
