import { IBiomarkerAssociation } from 'app/shared/model/biomarker-association.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { biomarkerAssociationClient } from 'app/shared/api/clients';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const apiUrl = 'api/biomarker-associations';

export class BiomarkerAssociationStore extends CrudStore<IBiomarkerAssociation> {
  getByCompanionDiagnosticDevice = this.readHandler(this.getByCompanionDiagnosticDeviceGen);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }

  *getByCompanionDiagnosticDeviceGen(id: number) {
    try {
      this.loading = true;
      const result = yield biomarkerAssociationClient.getBiomarkerAssociationByCompanionDiagnosticDevice(id);
      this.entities = result.data;
      this.totalItems = result.data.length;
      return this.entities;
    } catch (error) {
      notifyError(error);
    } finally {
      this.loading = false;
    }
  }
}

export default BiomarkerAssociationStore;
