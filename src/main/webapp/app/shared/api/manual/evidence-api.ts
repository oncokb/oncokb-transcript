import { getEvidence } from 'app/shared/util/core-submission/core-submission';
import { BASE_PATH, BaseAPI, RequestArgs } from '../generated/core/base';
import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../generated/core';
import { createRequestFunction } from '../generated/core/common';
import { DUMMY_BASE_URL, assertParamExists, serializeDataIfNeeded, setSearchParams, toPathString } from '../generated/core/common';

export const EvidenceAxiosParamCreator = function (configuration?: Configuration) {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async submitEvidences(evidences: ReturnType<typeof getEvidence>, options: AxiosRequestConfig = {}): Promise<RequestArgs> {
      // verify required parameter 'requestBody' is not null or undefined
      assertParamExists('submitToEvidencesToCore', 'evidences', evidences);
      const localVarPath = `/legacy-api/evidences/update`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions: { headers: any };
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter['Content-Type'] = 'application/json';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      const headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      localVarRequestOptions.data = serializeDataIfNeeded(evidences, localVarRequestOptions, configuration);

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

export const EvidenceApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = EvidenceAxiosParamCreator(configuration);
  return {
    async submitEvidences(
      evidences: ReturnType<typeof getEvidence>,
      options: AxiosRequestConfig = {},
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.submitEvidences(evidences, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
  };
};

export class EvidenceApi extends BaseAPI {
  public submitEvidences(evidences: ReturnType<typeof getEvidence>, options?: AxiosRequestConfig) {
    return EvidenceApiFp(this.configuration)
      .submitEvidences(evidences, options)
      .then(request => request(this.axios, this.basePath));
  }
}
