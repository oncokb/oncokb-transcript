# Gene

## Properties

| Name              | Type                                   | Description | Notes                             |
| ----------------- | -------------------------------------- | ----------- | --------------------------------- |
| **entrezGeneId**  | **number**                             |             | [optional] [default to undefined] |
| **geneAliases**   | **Array&lt;string&gt;**                |             | [optional] [default to undefined] |
| **genesets**      | [**Array&lt;Geneset&gt;**](Geneset.md) |             | [optional] [default to undefined] |
| **grch37Isoform** | **string**                             |             | [optional] [default to undefined] |
| **grch37RefSeq**  | **string**                             |             | [optional] [default to undefined] |
| **grch38Isoform** | **string**                             |             | [optional] [default to undefined] |
| **grch38RefSeq**  | **string**                             |             | [optional] [default to undefined] |
| **hugoSymbol**    | **string**                             |             | [optional] [default to undefined] |
| **oncogene**      | **boolean**                            |             | [optional] [default to undefined] |
| **tsg**           | **boolean**                            |             | [optional] [default to undefined] |

## Example

```typescript
import { Gene } from './api';

const instance: Gene = {
  entrezGeneId,
  geneAliases,
  genesets,
  grch37Isoform,
  grch37RefSeq,
  grch38Isoform,
  grch38RefSeq,
  hugoSymbol,
  oncogene,
  tsg,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
