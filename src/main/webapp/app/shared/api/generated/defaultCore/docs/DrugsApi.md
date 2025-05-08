# DrugsApi

All URIs are relative to _http://localhost:8080/app/api/v1_

| Method                                              | HTTP request              | Description   |
| --------------------------------------------------- | ------------------------- | ------------- |
| [**searchDrugGetUsingGET**](#searchdruggetusingget) | **GET** /search/ncitDrugs | searchDrugGet |

# **searchDrugGetUsingGET**

> Array<Drug> searchDrugGetUsingGET()

Find NCIT matches based on blur query. This is not for search OncoKB curated drugs. Please use drugs/lookup for that purpose.

### Example

```typescript
import { DrugsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new DrugsApi(configuration);

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
