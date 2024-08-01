import { BASE_PATH, BaseAPI, RequestArgs } from '../generated/core/base';
import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../generated/core';
import { createRequestFunction } from '../generated/core/common';
import { DUMMY_BASE_URL, assertParamExists, serializeDataIfNeeded, setSearchParams, toPathString } from '../generated/core/common';
import { createGeneTypePayload } from 'app/shared/util/core-gene-type-submission/core-gene-type-submission';

export const GeneTypeAxiosParamCreator = function (configuration?: Configuration) {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async submitGeneTypeToCore(
      geneTypePayload: ReturnType<typeof createGeneTypePayload>,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> {
      // verify required parameter 'requestBody' is not null or undefined
      assertParamExists('submitGeneTypeToCore', 'geneTypePayload', geneTypePayload);
      const localVarPath = `/legacy-api/genes/update/${geneTypePayload.hugoSymbol}`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions: { headers: any } | undefined = undefined;
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
      localVarRequestOptions.data = serializeDataIfNeeded(geneTypePayload, localVarRequestOptions, configuration);

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

export const GeneTypeApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = GeneTypeAxiosParamCreator(configuration);
  return {
    async submitGeneTypeToCore(
      geneType: ReturnType<typeof createGeneTypePayload>,
      options: AxiosRequestConfig = {},
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.submitGeneTypeToCore(geneType, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
  };
};

export class GeneTypeApi extends BaseAPI {
  public submitGeneTypeToCore(geneTypePayload: ReturnType<typeof createGeneTypePayload>, options?: AxiosRequestConfig) {
    return GeneTypeApiFp(this.configuration)
      .submitGeneTypeToCore(geneTypePayload, options)
      .then(request => request(this.axios, this.basePath));
  }
}
