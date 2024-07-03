import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';

export interface ISpecimenType {
  id?: number;
  type?: string;
  name?: string;
  companionDiagnosticDevices?: ICompanionDiagnosticDevice[] | null;
}

export const defaultValue: Readonly<ISpecimenType> = {};
