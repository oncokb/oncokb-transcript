import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/companion-diagnostic-devices';

export class CompanionDiagnosticDeviceStore extends CrudStore<ICompanionDiagnosticDevice> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default CompanionDiagnosticDeviceStore;
