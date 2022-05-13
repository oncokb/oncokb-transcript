import axiosInstance from './axiosInstance';
import { AlterationResourceApi, DeviceUsageIndicationResourceApi } from './generated/api';

export const deviceUsageIndicationClient = new DeviceUsageIndicationResourceApi(null, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
