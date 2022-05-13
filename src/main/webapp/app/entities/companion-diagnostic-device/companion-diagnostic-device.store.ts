import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';
import { ICrudPutAction, ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/companion-diagnostic-devices';
const apiSearchUrl = 'api/_search/companion-diagnostic-devices';

export class CompanionDiagnosticDeviceStore extends CrudStore<ICompanionDiagnosticDevice> {
  searchEntities: ICrudSearchAction<ICompanionDiagnosticDevice> = this.readHandler(this.getSearch);
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
