# SearchApi

All URIs are relative to _http://localhost:8080/app/api/v1_

| Method                                                                          | HTTP request                        | Description                 |
| ------------------------------------------------------------------------------- | ----------------------------------- | --------------------------- |
| [**searchDrugGetUsingGET**](#searchdruggetusingget)                             | **GET** /search/ncitDrugs           | searchDrugGet               |
| [**searchTreatmentsGetUsingGET**](#searchtreatmentsgetusingget)                 | **GET** /search/treatments          | searchTreatmentsGet         |
| [**searchTypeAheadGetUsingGET**](#searchtypeaheadgetusingget)                   | **GET** /search/typeahead           | searchTypeAheadGet          |
| [**searchVariantsBiologicalGetUsingGET**](#searchvariantsbiologicalgetusingget) | **GET** /search/variants/biological | searchVariantsBiologicalGet |
| [**searchVariantsClinicalGetUsingGET**](#searchvariantsclinicalgetusingget)     | **GET** /search/variants/clinical   | searchVariantsClinicalGet   |

# **searchDrugGetUsingGET**

> Array<Drug> searchDrugGetUsingGET()

Find NCIT matches based on blur query. This is not for search OncoKB curated drugs. Please use drugs/lookup for that purpose.

### Example

```typescript
import { SearchApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let query: string; //The search query, it could be drug name, NCIT code (default to undefined)
let limit: number; //The limit of returned result. (optional) (default to 5)

const { status, data } = await apiInstance.searchDrugGetUsingGET(query, limit);
```

### Parameters

| Name      | Type         | Description                                        | Notes                    |
| --------- | ------------ | -------------------------------------------------- | ------------------------ |
| **query** | [**string**] | The search query, it could be drug name, NCIT code | defaults to undefined    |
| **limit** | [**number**] | The limit of returned result.                      | (optional) defaults to 5 |

### Return type

**Array<Drug>**

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

# **searchTreatmentsGetUsingGET**

> Array<Treatment> searchTreatmentsGetUsingGET()

Search to find treatments.

### Example

```typescript
import { SearchApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let gene: string; //The search query, it could be hugoSymbol or entrezGeneId. (default to undefined)
let level: string; //The level of evidence. (optional) (default to 'false')

const { status, data } = await apiInstance.searchTreatmentsGetUsingGET(gene, level);
```

### Parameters

| Name      | Type         | Description                                               | Notes                          |
| --------- | ------------ | --------------------------------------------------------- | ------------------------------ |
| **gene**  | [**string**] | The search query, it could be hugoSymbol or entrezGeneId. | defaults to undefined          |
| **level** | [**string**] | The level of evidence.                                    | (optional) defaults to 'false' |

### Return type

**Array<Treatment>**

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

# **searchTypeAheadGetUsingGET**

> Array<TypeaheadSearchResp> searchTypeAheadGetUsingGET()

Find matches based on blur query.

### Example

```typescript
import { SearchApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let query: string; //The search query, it could be hugoSymbol, entrezGeneId, variant, or cancer type. At least two characters. Maximum two keywords are supported, separated by space (default to undefined)
let limit: number; //The limit of returned result. (optional) (default to 5)

const { status, data } = await apiInstance.searchTypeAheadGetUsingGET(query, limit);
```

### Parameters

| Name      | Type         | Description                                                                                                                                                      | Notes                    |
| --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **query** | [**string**] | The search query, it could be hugoSymbol, entrezGeneId, variant, or cancer type. At least two characters. Maximum two keywords are supported, separated by space | defaults to undefined    |
| **limit** | [**number**] | The limit of returned result.                                                                                                                                    | (optional) defaults to 5 |

### Return type

**Array<TypeaheadSearchResp>**

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

# **searchVariantsBiologicalGetUsingGET**

> Array<BiologicalVariant> searchVariantsBiologicalGetUsingGET()

Get annotated variants information for specified gene.

### Example

```typescript
import { SearchApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)

const { status, data } = await apiInstance.searchVariantsBiologicalGetUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description | Notes                            |
| -------------- | ------------ | ----------- | -------------------------------- |
| **hugoSymbol** | [**string**] | hugoSymbol  | (optional) defaults to undefined |

### Return type

**Array<BiologicalVariant>**

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

# **searchVariantsClinicalGetUsingGET**

> Array<ClinicalVariant> searchVariantsClinicalGetUsingGET()

Get list of variant clinical information for specified gene.

### Example

```typescript
import { SearchApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)

const { status, data } = await apiInstance.searchVariantsClinicalGetUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description | Notes                            |
| -------------- | ------------ | ----------- | -------------------------------- |
| **hugoSymbol** | [**string**] | hugoSymbol  | (optional) defaults to undefined |

### Return type

**Array<ClinicalVariant>**

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
