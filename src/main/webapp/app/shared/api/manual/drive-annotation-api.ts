import { BASE_PATH, BaseAPI, RequestArgs } from '../generated/core/base';
import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../generated/core';
import { createRequestFunction } from '../generated/core/common';
import { DUMMY_BASE_URL, assertParamExists, serializeDataIfNeeded, setSearchParams, toPathString } from '../generated/core/common';
import { getDriveAnnotations as getDriveAnnotation } from 'app/shared/util/core-drive-annotation-submission/core-drive-annotation-submission';

export const DriveAnnotationAxiosParamCreator = function (configuration?: Configuration) {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async submitDriveAnnotations(
      driveAnnotation: ReturnType<typeof getDriveAnnotation>,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> {
      // verify required parameter 'requestBody' is not null or undefined
      assertParamExists('submitToDriveAnnotationsToCore', 'evidences', driveAnnotation);
      const localVarPath = `/legacy-api/driveAnnotation`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions: { headers: any } | undefined = undefined;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter['Content-Type'] = 'application/x-www-form-urlencoded';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      const headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      const bodyFormData = new URLSearchParams();
      for (const [key, value] of Object.entries(driveAnnotation)) {
        if (typeof value === 'boolean') {
          bodyFormData.append(key, `${value}`);
        } else if (value !== undefined) {
          bodyFormData.append(key, value);
        }
      }
      localVarRequestOptions.data = bodyFormData;

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

export const DriveAnnotationApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = DriveAnnotationAxiosParamCreator(configuration);
  return {
    async submitDriveAnnotations(
      driveAnnotation: ReturnType<typeof getDriveAnnotation>,
      options: AxiosRequestConfig = {},
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.submitDriveAnnotations(driveAnnotation, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
  };
};

export class DriveAnnotationApi extends BaseAPI {
  public submitDriveAnnotations(driveAnnotation: ReturnType<typeof getDriveAnnotation>, options?: AxiosRequestConfig) {
    return DriveAnnotationApiFp(this.configuration)
      .submitDriveAnnotations(driveAnnotation, options)
      .then(request => request(this.axios, this.basePath));
  }
}
