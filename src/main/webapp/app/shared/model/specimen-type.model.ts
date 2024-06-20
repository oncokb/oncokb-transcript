import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';

// CrudStore needs Record<string, unknown> as a type so we can't use an interface
export type ISpecimenType = {
  id?: number;
  type?: string;
  name?: string;
  companionDiagnosticDevices?: ICompanionDiagnosticDevice[] | null;
};

export const defaultValue: Readonly<ISpecimenType> = {};
