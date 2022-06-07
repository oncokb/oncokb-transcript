import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/device-usage-indications';

export class DeviceUsageIndicationStore extends CrudStore<IDeviceUsageIndication> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default DeviceUsageIndicationStore;
