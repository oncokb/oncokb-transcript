import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { deviceUsageIndicationClient } from 'app/shared/api/clients';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const apiUrl = 'api/device-usage-indications';

export class DeviceUsageIndicationStore extends CrudStore<IDeviceUsageIndication> {
  getByCompanionDiagnosticDevice = this.readHandler(this.getByCompanionDiagnosticDeviceGen);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }

  *getByCompanionDiagnosticDeviceGen(id: number) {
    try {
      this.loading = true;
      const result = yield deviceUsageIndicationClient.getDeviceUsageIndicationByCompanionDiagnosticDevice(id);
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

export default DeviceUsageIndicationStore;
