import { createGeneTypePayload, removeGenePayload } from 'app/shared/util/core-gene-type-submission/core-gene-type-submission';
import { BASE_PATH, BaseAPI, RequestArgs } from '../generated/core/base';
import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../generated/core';
import { createRequestFunction } from '../generated/core/common';
import { DUMMY_BASE_URL, assertParamExists, serializeDataIfNeeded, setSearchParams, toPathString } from '../generated/core/common';

export const GeneAxiosParamCreator = function (configuration?: Configuration) {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async submitGenes(genes: ReturnType<typeof createGeneTypePayload>, options: AxiosRequestConfig = {}): Promise<RequestArgs> {
      // verify required parameter 'requestBody' is not null or undefined
      assertParamExists('submitToGenesToCore', 'genes', genes);
      const localVarPath = `/legacy-api/gene/update`;
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
      localVarRequestOptions.data = serializeDataIfNeeded(genes, localVarRequestOptions, configuration);

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async removeGene(gene: ReturnType<typeof removeGenePayload>, options: AxiosRequestConfig = {}): Promise<RequestArgs> {
      // verify required parameter 'requestBody' is not null or undefined
      assertParamExists('removeGeneFromCore', 'gene', gene);

      const localVarPath = `/legacy-api/genes/remove/${gene.hugoSymbol}`;
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

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

export const GeneApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = GeneAxiosParamCreator(configuration);
  return {
    async submitGenes(
      genes: ReturnType<typeof createGeneTypePayload>,
      options: AxiosRequestConfig = {},
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.submitGenes(genes, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
    async removeGene(
      gene: ReturnType<typeof removeGenePayload>,
      options: AxiosRequestConfig = {},
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.removeGene(gene, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
  };
};

export class GeneApi extends BaseAPI {
  public submitGenes(genes: ReturnType<typeof createGeneTypePayload>, options?: AxiosRequestConfig) {
    return GeneApiFp(this.configuration)
      .submitGenes(genes, options)
      .then(request => request(this.axios, this.basePath));
  }

  public removeGene(gene: ReturnType<typeof removeGenePayload>, options?: AxiosRequestConfig) {
    return GeneApiFp(this.configuration)
      .removeGene(gene, options)
      .then(request => request(this.axios, this.basePath));
  }
}
