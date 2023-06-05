import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';

const apiUrl = 'api/companion-diagnostic-devices';
const apiSearchUrl = 'api/_search/companion-diagnostic-devices';

export class CompanionDiagnosticDeviceStore extends CrudStore<ICompanionDiagnosticDevice> {
  searchEntities = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query }) {
    const searchResults = yield axios.get<ICompanionDiagnosticDevice[]>(`${apiSearchUrl}?query=${query}`);
    this.entities = searchResults.data;
    return this.entities;
  }
}

export default CompanionDiagnosticDeviceStore;
