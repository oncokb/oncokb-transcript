# UtilsApi

All URIs are relative to _http://localhost:8080/app/api/v1_

| Method                                                                                                          | HTTP request                                       | Description                                |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| [**utilAnnotateCPLUsingPOST**](#utilannotatecplusingpost)                                                       | **POST** /utils/annotateCPL                        | utilAnnotateCPL                            |
| [**utilDataAvailabilityGetUsingGET**](#utildataavailabilitygetusingget)                                         | **GET** /utils/data/availability                   | utilDataAvailabilityGet                    |
| [**utilDataReadmeGetUsingGET**](#utildatareadmegetusingget)                                                     | **GET** /utils/data/readme                         | utilDataReadmeGet                          |
| [**utilDataSqlDumpGetUsingGET**](#utildatasqldumpgetusingget)                                                   | **GET** /utils/data/sqlDump                        | utilDataSqlDumpGet                         |
| [**utilDataTranscriptSqlDumpUsingGET**](#utildatatranscriptsqldumpusingget)                                     | **GET** /utils/data/transcriptSqlDump              | utilDataTranscriptSqlDump                  |
| [**utilFilterGenomicChangeBasedOnCoveragePostUsingPOST**](#utilfiltergenomicchangebasedoncoveragepostusingpost) | **POST** /utils/filterGenomicChangeBasedOnCoverage | utilFilterGenomicChangeBasedOnCoveragePost |
| [**utilFilterHgvsgBasedOnCoveragePostUsingPOST**](#utilfilterhgvsgbasedoncoveragepostusingpost)                 | **POST** /utils/filterHgvsgBasedOnCoverage         | utilFilterHgvsgBasedOnCoveragePost         |
| [**utilMutationMapperDataGetUsingGET**](#utilmutationmapperdatagetusingget)                                     | **GET** /utils/mutationMapperData                  | utilMutationMapperDataGet                  |
| [**utilPortalAlterationSampleCountGetUsingGET**](#utilportalalterationsamplecountgetusingget)                   | **GET** /utils/portalAlterationSampleCount         | utilPortalAlterationSampleCountGet         |
| [**utilRelevantAlterationsGetUsingGET**](#utilrelevantalterationsgetusingget)                                   | **GET** /utils/relevantAlterations                 | utilRelevantAlterationsGet                 |
| [**utilRelevantCancerTypesPostUsingPOST**](#utilrelevantcancertypespostusingpost)                               | **POST** /utils/relevantCancerTypes                | utilRelevantCancerTypesPost                |
| [**utilRelevantTumorTypesGetUsingGET**](#utilrelevanttumortypesgetusingget)                                     | **GET** /utils/relevantTumorTypes                  | utilRelevantTumorTypesGet                  |
| [**utilUpdateTranscriptGetUsingGET**](#utilupdatetranscriptgetusingget)                                         | **GET** /utils/updateTranscript                    | utilUpdateTranscriptGet                    |
| [**utilValidateTranscriptUpdateGetUsingGET**](#utilvalidatetranscriptupdategetusingget)                         | **GET** /utils/validateTranscriptUpdate            | utilValidateTranscriptUpdateGet            |
| [**utilVariantAnnotationGetUsingGET**](#utilvariantannotationgetusingget)                                       | **GET** /utils/variantAnnotation                   | utilVariantAnnotationGet                   |
| [**utilsEnsemblGenesGetUsingGET**](#utilsensemblgenesgetusingget)                                               | **GET** /utils/ensembleGenes                       | utilsEnsemblGenesGet                       |
| [**utilsEvidencesByLevelsGetUsingGET**](#utilsevidencesbylevelsgetusingget)                                     | **GET** /utils/evidences/levels                    | utilsEvidencesByLevelsGet                  |
| [**utilsHotspotMutationGetUsingGET**](#utilshotspotmutationgetusingget)                                         | **GET** /utils/isHotspot                           | utilsHotspotMutationGet                    |
| [**utilsNumbersGeneGetUsingGET**](#utilsnumbersgenegetusingget)                                                 | **GET** /utils/numbers/gene/{hugoSymbol}           | utilsNumbersGeneGet                        |
| [**utilsNumbersGenesGetUsingGET**](#utilsnumbersgenesgetusingget)                                               | **GET** /utils/numbers/genes/                      | utilsNumbersGenesGet                       |
| [**utilsNumbersLevelsGetUsingGET**](#utilsnumberslevelsgetusingget)                                             | **GET** /utils/numbers/levels/                     | utilsNumbersLevelsGet                      |
| [**utilsNumbersMainGetUsingGET**](#utilsnumbersmaingetusingget)                                                 | **GET** /utils/numbers/main/                       | utilsNumbersMainGet                        |
| [**utilsSuggestedVariantsGetUsingGET**](#utilssuggestedvariantsgetusingget)                                     | **GET** /utils/suggestedVariants                   | utilsSuggestedVariantsGet                  |
| [**utilsTumorTypesGetUsingGET**](#utilstumortypesgetusingget)                                                   | **GET** /utils/tumorTypes                          | utilsTumorTypesGet                         |
| [**validateTrialsUsingGET**](#validatetrialsusingget)                                                           | **GET** /utils/validation/trials                   | validateTrials                             |
| [**validateVariantExampleGetUsingGET**](#validatevariantexamplegetusingget)                                     | **GET** /utils/match/variant                       | validateVariantExampleGet                  |
| [**validateVariantExamplePostUsingPOST**](#validatevariantexamplepostusingpost)                                 | **POST** /utils/match/variant                      | validateVariantExamplePost                 |

# **utilAnnotateCPLUsingPOST**

> string utilAnnotateCPLUsingPOST(cplRequest)

Annotate a string using CPL

### Example

```typescript
import { UtilsApi, Configuration, CplAnnotationRequest } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let cplRequest: CplAnnotationRequest; //CPL Request

const { status, data } = await apiInstance.utilAnnotateCPLUsingPOST(cplRequest);
```

### Parameters

| Name           | Type                     | Description | Notes |
| -------------- | ------------------------ | ----------- | ----- |
| **cplRequest** | **CplAnnotationRequest** | CPL Request |       |

### Return type

**string**

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

# **utilDataAvailabilityGetUsingGET**

> Array<DownloadAvailability> utilDataAvailabilityGetUsingGET()

Get information about what files are available by data version

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilDataAvailabilityGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<DownloadAvailability>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | OK                  | -                |
| **401**     | Unauthorized        | -                |
| **403**     | Forbidden           | -                |
| **404**     | Not Found           | -                |
| **503**     | Service Unavailable | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilDataReadmeGetUsingGET**

> string utilDataReadmeGetUsingGET()

Get readme info for specific data release version

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let version: string; //version (optional) (default to undefined)

const { status, data } = await apiInstance.utilDataReadmeGetUsingGET(version);
```

### Parameters

| Name        | Type         | Description | Notes                            |
| ----------- | ------------ | ----------- | -------------------------------- |
| **version** | [**string**] | version     | (optional) defaults to undefined |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | OK                  | -                |
| **401**     | Unauthorized        | -                |
| **403**     | Forbidden           | -                |
| **404**     | Not Found           | -                |
| **503**     | Service Unavailable | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilDataSqlDumpGetUsingGET**

> Array<string> utilDataSqlDumpGetUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let version: string; //version (optional) (default to undefined)

const { status, data } = await apiInstance.utilDataSqlDumpGetUsingGET(version);
```

### Parameters

| Name        | Type         | Description | Notes                            |
| ----------- | ------------ | ----------- | -------------------------------- |
| **version** | [**string**] | version     | (optional) defaults to undefined |

### Return type

**Array<string>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/gz

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilDataTranscriptSqlDumpUsingGET**

> Array<string> utilDataTranscriptSqlDumpUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let version: string; //version (optional) (default to undefined)

const { status, data } = await apiInstance.utilDataTranscriptSqlDumpUsingGET(version);
```

### Parameters

| Name        | Type         | Description | Notes                            |
| ----------- | ------------ | ----------- | -------------------------------- |
| **version** | [**string**] | version     | (optional) defaults to undefined |

### Return type

**Array<string>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/gz

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilFilterGenomicChangeBasedOnCoveragePostUsingPOST**

> Array<string> utilFilterGenomicChangeBasedOnCoveragePostUsingPOST(body)

Filter genomic change based on oncokb coverage

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let body: Array<AnnotateMutationByGenomicChangeQuery>; //List of queries.

const { status, data } = await apiInstance.utilFilterGenomicChangeBasedOnCoveragePostUsingPOST(body);
```

### Parameters

| Name     | Type                                            | Description      | Notes |
| -------- | ----------------------------------------------- | ---------------- | ----- |
| **body** | **Array<AnnotateMutationByGenomicChangeQuery>** | List of queries. |       |

### Return type

**Array<string>**

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

# **utilFilterHgvsgBasedOnCoveragePostUsingPOST**

> Array<string> utilFilterHgvsgBasedOnCoveragePostUsingPOST(body)

Filter HGVSg based on oncokb coverage

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let body: Array<AnnotateMutationByHGVSgQuery>; //List of queries.

const { status, data } = await apiInstance.utilFilterHgvsgBasedOnCoveragePostUsingPOST(body);
```

### Parameters

| Name     | Type                                    | Description      | Notes |
| -------- | --------------------------------------- | ---------------- | ----- |
| **body** | **Array<AnnotateMutationByHGVSgQuery>** | List of queries. |       |

### Return type

**Array<string>**

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

# **utilMutationMapperDataGetUsingGET**

> Array<PortalAlteration> utilMutationMapperDataGetUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)

const { status, data } = await apiInstance.utilMutationMapperDataGetUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description | Notes                            |
| -------------- | ------------ | ----------- | -------------------------------- |
| **hugoSymbol** | [**string**] | hugoSymbol  | (optional) defaults to undefined |

### Return type

**Array<PortalAlteration>**

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

# **utilPortalAlterationSampleCountGetUsingGET**

> Array<CancerTypeCount> utilPortalAlterationSampleCountGetUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)

const { status, data } = await apiInstance.utilPortalAlterationSampleCountGetUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description | Notes                            |
| -------------- | ------------ | ----------- | -------------------------------- |
| **hugoSymbol** | [**string**] | hugoSymbol  | (optional) defaults to undefined |

### Return type

**Array<CancerTypeCount>**

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

# **utilRelevantAlterationsGetUsingGET**

> Array<Alteration> utilRelevantAlterationsGetUsingGET()

Get the list of relevant alterations

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let referenceGenome: string; //Reference genome, either GRCh37 or GRCh38. The default is GRCh37 (optional) (default to 'GRCh37')
let entrezGeneId: number; //alteration (optional) (default to undefined)
let alteration: string; //alteration (optional) (default to undefined)

const { status, data } = await apiInstance.utilRelevantAlterationsGetUsingGET(referenceGenome, entrezGeneId, alteration);
```

### Parameters

| Name                | Type         | Description                                                      | Notes                            |
| ------------------- | ------------ | ---------------------------------------------------------------- | -------------------------------- |
| **referenceGenome** | [**string**] | Reference genome, either GRCh37 or GRCh38. The default is GRCh37 | (optional) defaults to 'GRCh37'  |
| **entrezGeneId**    | [**number**] | alteration                                                       | (optional) defaults to undefined |
| **alteration**      | [**string**] | alteration                                                       | (optional) defaults to undefined |

### Return type

**Array<Alteration>**

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

# **utilRelevantCancerTypesPostUsingPOST**

> Array<TumorType> utilRelevantCancerTypesPostUsingPOST(body)

Get the list of relevant tumor types.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let body: Array<RelevantCancerTypeQuery>; //List of queries.
let levelOfEvidence:
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3A'
  | 'LEVEL_3B'
  | 'LEVEL_4'
  | 'LEVEL_R1'
  | 'LEVEL_R2'
  | 'LEVEL_Px1'
  | 'LEVEL_Px2'
  | 'LEVEL_Px3'
  | 'LEVEL_Dx1'
  | 'LEVEL_Dx2'
  | 'LEVEL_Dx3'
  | 'LEVEL_Fda1'
  | 'LEVEL_Fda2'
  | 'LEVEL_Fda3'
  | 'NO'; //Level of Evidence (optional) (default to undefined)

const { status, data } = await apiInstance.utilRelevantCancerTypesPostUsingPOST(body, levelOfEvidence);
```

### Parameters

| Name                | Type                               | Description       | Notes              |
| ------------------- | ---------------------------------- | ----------------- | ------------------ | ------------------ | ----------------- | ------------------ | ------------------ | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | -------------------- | -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------- |
| **body**            | **Array<RelevantCancerTypeQuery>** | List of queries.  |                    |
| **levelOfEvidence** | [\*\*&#39;LEVEL_1&#39;             | &#39;LEVEL_2&#39; | &#39;LEVEL_3A&#39; | &#39;LEVEL_3B&#39; | &#39;LEVEL_4&#39; | &#39;LEVEL_R1&#39; | &#39;LEVEL_R2&#39; | &#39;LEVEL_Px1&#39; | &#39;LEVEL_Px2&#39; | &#39;LEVEL_Px3&#39; | &#39;LEVEL_Dx1&#39; | &#39;LEVEL_Dx2&#39; | &#39;LEVEL_Dx3&#39; | &#39;LEVEL_Fda1&#39; | &#39;LEVEL_Fda2&#39; | &#39;LEVEL_Fda3&#39; | &#39;NO&#39;**]**Array<&#39;LEVEL_1&#39; &#124; &#39;LEVEL_2&#39; &#124; &#39;LEVEL_3A&#39; &#124; &#39;LEVEL_3B&#39; &#124; &#39;LEVEL_4&#39; &#124; &#39;LEVEL_R1&#39; &#124; &#39;LEVEL_R2&#39; &#124; &#39;LEVEL_Px1&#39; &#124; &#39;LEVEL_Px2&#39; &#124; &#39;LEVEL_Px3&#39; &#124; &#39;LEVEL_Dx1&#39; &#124; &#39;LEVEL_Dx2&#39; &#124; &#39;LEVEL_Dx3&#39; &#124; &#39;LEVEL_Fda1&#39; &#124; &#39;LEVEL_Fda2&#39; &#124; &#39;LEVEL_Fda3&#39; &#124; &#39;NO&#39;>\*\* | Level of Evidence | (optional) defaults to undefined |

### Return type

**Array<TumorType>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **201**     | Created      | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilRelevantTumorTypesGetUsingGET**

> Array<TumorType> utilRelevantTumorTypesGetUsingGET()

Get the list of relevant tumor types.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let tumorType: string; //OncoTree tumor type name/main type/code (optional) (default to undefined)

const { status, data } = await apiInstance.utilRelevantTumorTypesGetUsingGET(tumorType);
```

### Parameters

| Name          | Type         | Description                             | Notes                            |
| ------------- | ------------ | --------------------------------------- | -------------------------------- |
| **tumorType** | [**string**] | OncoTree tumor type name/main type/code | (optional) defaults to undefined |

### Return type

**Array<TumorType>**

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

# **utilUpdateTranscriptGetUsingGET**

> utilUpdateTranscriptGetUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)
let entrezGeneId: number; //entrezGeneId (optional) (default to undefined)
let grch37Isoform: string; //grch37Isoform (optional) (default to undefined)
let grch37RefSeq: string; //grch37RefSeq (optional) (default to undefined)
let grch38Isoform: string; //grch38Isoform (optional) (default to undefined)
let grch38RefSeq: string; //grch38RefSeq (optional) (default to undefined)

const { status, data } = await apiInstance.utilUpdateTranscriptGetUsingGET(
  hugoSymbol,
  entrezGeneId,
  grch37Isoform,
  grch37RefSeq,
  grch38Isoform,
  grch38RefSeq,
);
```

### Parameters

| Name              | Type         | Description   | Notes                            |
| ----------------- | ------------ | ------------- | -------------------------------- |
| **hugoSymbol**    | [**string**] | hugoSymbol    | (optional) defaults to undefined |
| **entrezGeneId**  | [**number**] | entrezGeneId  | (optional) defaults to undefined |
| **grch37Isoform** | [**string**] | grch37Isoform | (optional) defaults to undefined |
| **grch37RefSeq**  | [**string**] | grch37RefSeq  | (optional) defaults to undefined |
| **grch38Isoform** | [**string**] | grch38Isoform | (optional) defaults to undefined |
| **grch38RefSeq**  | [**string**] | grch38RefSeq  | (optional) defaults to undefined |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilValidateTranscriptUpdateGetUsingGET**

> string utilValidateTranscriptUpdateGetUsingGET()

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)
let entrezGeneId: number; //entrezGeneId (optional) (default to undefined)
let grch37Isoform: string; //grch37Isoform (optional) (default to undefined)
let grch38Isoform: string; //grch38Isoform (optional) (default to undefined)

const { status, data } = await apiInstance.utilValidateTranscriptUpdateGetUsingGET(hugoSymbol, entrezGeneId, grch37Isoform, grch38Isoform);
```

### Parameters

| Name              | Type         | Description   | Notes                            |
| ----------------- | ------------ | ------------- | -------------------------------- |
| **hugoSymbol**    | [**string**] | hugoSymbol    | (optional) defaults to undefined |
| **entrezGeneId**  | [**number**] | entrezGeneId  | (optional) defaults to undefined |
| **grch37Isoform** | [**string**] | grch37Isoform | (optional) defaults to undefined |
| **grch38Isoform** | [**string**] | grch38Isoform | (optional) defaults to undefined |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **utilVariantAnnotationGetUsingGET**

> VariantAnnotation utilVariantAnnotationGetUsingGET()

Get all the info for the query

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //hugoSymbol (optional) (default to undefined)
let entrezGeneId: number; //entrezGeneId (optional) (default to undefined)
let referenceGenome: string; //Reference genome, either GRCh37 or GRCh38. The default is GRCh37 (optional) (default to 'GRCh37')
let alteration: string; //Alteration (optional) (default to undefined)
let hgvsg: string; //HGVS genomic format. Example: 7:g.140453136A>T (optional) (default to undefined)
let genomicChange: string; //Genomic change format. Example: 7,140453136,140453136,A,T (optional) (default to undefined)
let tumorType: string; //OncoTree tumor type name/main type/code (optional) (default to undefined)

const { status, data } = await apiInstance.utilVariantAnnotationGetUsingGET(
  hugoSymbol,
  entrezGeneId,
  referenceGenome,
  alteration,
  hgvsg,
  genomicChange,
  tumorType,
);
```

### Parameters

| Name                | Type         | Description                                                      | Notes                            |
| ------------------- | ------------ | ---------------------------------------------------------------- | -------------------------------- |
| **hugoSymbol**      | [**string**] | hugoSymbol                                                       | (optional) defaults to undefined |
| **entrezGeneId**    | [**number**] | entrezGeneId                                                     | (optional) defaults to undefined |
| **referenceGenome** | [**string**] | Reference genome, either GRCh37 or GRCh38. The default is GRCh37 | (optional) defaults to 'GRCh37'  |
| **alteration**      | [**string**] | Alteration                                                       | (optional) defaults to undefined |
| **hgvsg**           | [**string**] | HGVS genomic format. Example: 7:g.140453136A&gt;T                | (optional) defaults to undefined |
| **genomicChange**   | [**string**] | Genomic change format. Example: 7,140453136,140453136,A,T        | (optional) defaults to undefined |
| **tumorType**       | [**string**] | OncoTree tumor type name/main type/code                          | (optional) defaults to undefined |

### Return type

**VariantAnnotation**

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

# **utilsEnsemblGenesGetUsingGET**

> Array<EnsemblGene> utilsEnsemblGenesGetUsingGET()

Get the list of Ensembl genes.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let entrezGeneId: number; //Gene entrez id (default to undefined)

const { status, data } = await apiInstance.utilsEnsemblGenesGetUsingGET(entrezGeneId);
```

### Parameters

| Name             | Type         | Description    | Notes                 |
| ---------------- | ------------ | -------------- | --------------------- |
| **entrezGeneId** | [**number**] | Gene entrez id | defaults to undefined |

### Return type

**Array<EnsemblGene>**

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

# **utilsEvidencesByLevelsGetUsingGET**

> object utilsEvidencesByLevelsGetUsingGET()

Get the list of evidences by levels.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsEvidencesByLevelsGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**object**

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

# **utilsHotspotMutationGetUsingGET**

> boolean utilsHotspotMutationGetUsingGET()

Determine whether variant is hotspot mutation.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //Gene hugo symbol (optional) (default to undefined)
let variant: string; //Variant name (optional) (default to undefined)

const { status, data } = await apiInstance.utilsHotspotMutationGetUsingGET(hugoSymbol, variant);
```

### Parameters

| Name           | Type         | Description      | Notes                            |
| -------------- | ------------ | ---------------- | -------------------------------- |
| **hugoSymbol** | [**string**] | Gene hugo symbol | (optional) defaults to undefined |
| **variant**    | [**string**] | Variant name     | (optional) defaults to undefined |

### Return type

**boolean**

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

# **utilsNumbersGeneGetUsingGET**

> GeneNumber utilsNumbersGeneGetUsingGET()

Get gene related numbers

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let hugoSymbol: string; //The gene symbol used in Human Genome Organisation. (default to undefined)

const { status, data } = await apiInstance.utilsNumbersGeneGetUsingGET(hugoSymbol);
```

### Parameters

| Name           | Type         | Description                                        | Notes                 |
| -------------- | ------------ | -------------------------------------------------- | --------------------- |
| **hugoSymbol** | [**string**] | The gene symbol used in Human Genome Organisation. | defaults to undefined |

### Return type

**GeneNumber**

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

# **utilsNumbersGenesGetUsingGET**

> Array<GeneNumber> utilsNumbersGenesGetUsingGET()

Get gene related numbers of all genes. This is for main page word cloud.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsNumbersGenesGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<GeneNumber>**

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

# **utilsNumbersLevelsGetUsingGET**

> Array<LevelNumber> utilsNumbersLevelsGetUsingGET()

Get gene related numbers of all genes. This is for main page word cloud.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsNumbersLevelsGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<LevelNumber>**

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

# **utilsNumbersMainGetUsingGET**

> MainNumber utilsNumbersMainGetUsingGET()

Get numbers served for the main page dashboard.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsNumbersMainGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**MainNumber**

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

# **utilsSuggestedVariantsGetUsingGET**

> Array<AnnotatedVariant> utilsSuggestedVariantsGetUsingGET()

Get All Suggested Variants.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsSuggestedVariantsGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<AnnotatedVariant>**

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

# **utilsTumorTypesGetUsingGET**

> Array<TumorType> utilsTumorTypesGetUsingGET()

Get the full list of TumorTypes.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

const { status, data } = await apiInstance.utilsTumorTypesGetUsingGET();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**Array<TumorType>**

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

# **validateTrialsUsingGET**

> object validateTrialsUsingGET()

Check if clinical trials are valid or not by nctId.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let nctIds: Array<string>; //NCTID list (optional) (default to undefined)

const { status, data } = await apiInstance.validateTrialsUsingGET(nctIds);
```

### Parameters

| Name       | Type                    | Description | Notes                            |
| ---------- | ----------------------- | ----------- | -------------------------------- |
| **nctIds** | **Array&lt;string&gt;** | NCTID list  | (optional) defaults to undefined |

### Return type

**object**

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

# **validateVariantExampleGetUsingGET**

> object validateVariantExampleGetUsingGET()

Check if the genomic example will be mapped to OncoKB variant.

### Example

```typescript
import { UtilsApi, Configuration } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let examples: string; //The genomic examples. (optional)

const { status, data } = await apiInstance.validateVariantExampleGetUsingGET(examples);
```

### Parameters

| Name         | Type       | Description           | Notes |
| ------------ | ---------- | --------------------- | ----- |
| **examples** | **string** | The genomic examples. |       |

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **validateVariantExamplePostUsingPOST**

> Array<MatchVariantResult> validateVariantExamplePostUsingPOST(body)

Check which OncoKB variants can be mapped on genomic examples.

### Example

```typescript
import { UtilsApi, Configuration, MatchVariantRequest } from './api';

const configuration = new Configuration();
const apiInstance = new UtilsApi(configuration);

let body: MatchVariantRequest; //List of queries. Please see swagger.json for request body format.

const { status, data } = await apiInstance.validateVariantExamplePostUsingPOST(body);
```

### Parameters

| Name     | Type                    | Description                                                       | Notes |
| -------- | ----------------------- | ----------------------------------------------------------------- | ----- |
| **body** | **MatchVariantRequest** | List of queries. Please see swagger.json for request body format. |       |

### Return type

**Array<MatchVariantResult>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **201**     | Created      | -                |
| **401**     | Unauthorized | -                |
| **403**     | Forbidden    | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
