# TranscriptApi

All URIs are relative to _http://localhost:8080/app/api/v1_

| Method                                                                                                                  | HTTP request                              | Description                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| [**cacheGenomeNexusVariantInfoPostUsingPOST**](#cachegenomenexusvariantinfopostusingpost)                               | **POST** /cacheGnVariantInfo              | cacheGenomeNexusVariantInfoPost                |
| [**fetchGenomeNexusVariantInfoByGenomicChangePostUsingPOST**](#fetchgenomenexusvariantinfobygenomicchangepostusingpost) | **POST** /fetchGnVariants/byGenomicChange | fetchGenomeNexusVariantInfoByGenomicChangePost |
| [**fetchGenomeNexusVariantInfoByHGVSgPostUsingPOST**](#fetchgenomenexusvariantinfobyhgvsgpostusingpost)                 | **POST** /fetchGnVariants/byHGVSg         | fetchGenomeNexusVariantInfoByHGVSgPost         |
| [**getTranscriptUsingGET**](#gettranscriptusingget)                                                                     | **GET** /transcripts/{hugoSymbol}         | getTranscript                                  |

# **cacheGenomeNexusVariantInfoPostUsingPOST**

> cacheGenomeNexusVariantInfoPostUsingPOST(body)

cache Genome Nexus variant info

### Example

```typescript
import { TranscriptApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new TranscriptApi(configuration);

let body: Array<GenomeNexusAnnotatedVariantInfo>; //List of queries. Please see swagger.json for request body format.

const { status, data } = await apiInstance.cacheGenomeNexusVariantInfoPostUsingPOST(body);
```

### Parameters

| Name     | Type                                       | Description                                                       | Notes |
| -------- | ------------------------------------------ | ----------------------------------------------------------------- | ----- |
| **body** | **Array<GenomeNexusAnnotatedVariantInfo>** | List of queries. Please see swagger.json for request body format. |       |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | OK                                  | -                |
| **201**     | Created                             | -                |
| **400**     | Error, error message will be given. | -                |
| **401**     | Unauthorized                        | -                |
| **403**     | Forbidden                           | -                |
| **404**     | Not Found                           | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fetchGenomeNexusVariantInfoByGenomicChangePostUsingPOST**

> Array<GenomeNexusAnnotatedVariantInfo> fetchGenomeNexusVariantInfoByGenomicChangePostUsingPOST(body)

Fetch Genome Nexus variant info by genomic change

### Example

```typescript
import { TranscriptApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new TranscriptApi(configuration);

let body: Array<AnnotateMutationByGenomicChangeQuery>; //List of queries. Please see swagger.json for request body format.

const { status, data } = await apiInstance.fetchGenomeNexusVariantInfoByGenomicChangePostUsingPOST(body);
```

### Parameters

| Name     | Type                                            | Description                                                       | Notes |
| -------- | ----------------------------------------------- | ----------------------------------------------------------------- | ----- |
| **body** | **Array<AnnotateMutationByGenomicChangeQuery>** | List of queries. Please see swagger.json for request body format. |       |

### Return type

**Array<GenomeNexusAnnotatedVariantInfo>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | OK                                  | -                |
| **201**     | Created                             | -                |
| **400**     | Error, error message will be given. | -                |
| **401**     | Unauthorized                        | -                |
| **403**     | Forbidden                           | -                |
| **404**     | Not Found                           | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fetchGenomeNexusVariantInfoByHGVSgPostUsingPOST**

> Array<GenomeNexusAnnotatedVariantInfo> fetchGenomeNexusVariantInfoByHGVSgPostUsingPOST(body)

Fetch Genome Nexus variant info by HGVSg

### Example

```typescript
import { TranscriptApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new TranscriptApi(configuration);

let body: Array<AnnotateMutationByHGVSgQuery>; //List of queries. Please see swagger.json for request body format.

const { status, data } = await apiInstance.fetchGenomeNexusVariantInfoByHGVSgPostUsingPOST(body);
```

### Parameters

| Name     | Type                                    | Description                                                       | Notes |
| -------- | --------------------------------------- | ----------------------------------------------------------------- | ----- |
| **body** | **Array<AnnotateMutationByHGVSgQuery>** | List of queries. Please see swagger.json for request body format. |       |

### Return type

**Array<GenomeNexusAnnotatedVariantInfo>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                         | Response headers |
| ----------- | ----------------------------------- | ---------------- |
| **200**     | OK                                  | -                |
| **201**     | Created                             | -                |
| **400**     | Error, error message will be given. | -                |
| **401**     | Unauthorized                        | -                |
| **403**     | Forbidden                           | -                |
| **404**     | Not Found                           | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTranscriptUsingGET**

> TranscriptResult getTranscriptUsingGET()

Get transcript info in both GRCh37 and 38.

### Example

```typescript
import { TranscriptApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new TranscriptApi(configuration);

let hugoSymbol: string; //hugoSymbol (default to undefined)

const { status, data } = await apiInstance.getTranscriptUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description | Notes                 |
| -------------- | ------------ | ----------- | --------------------- |
| **hugoSymbol** | [**string**] | hugoSymbol  | defaults to undefined |

### Return type

**TranscriptResult**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
