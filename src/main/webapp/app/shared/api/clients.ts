import axiosInstance from './axiosInstance';
import {
  AlterationControllerApi,
  AlterationResourceApi,
  DeviceUsageIndicationResourceApi,
  FdaSubmissionResourceApi,
} from './generated/api';

export const deviceUsageIndicationClient = new DeviceUsageIndicationResourceApi(null, '', axiosInstance);
export const fdaSubmissionClient = new FdaSubmissionResourceApi(null, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
export const alterationControllerClient = new AlterationControllerApi(null, '', axiosInstance);
