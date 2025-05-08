# Implication

## Properties

| Name                | Type                                                   | Description                                                                        | Notes                             |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------- |
| **abstracts**       | [**Array&lt;ArticleAbstract&gt;**](ArticleAbstract.md) | List of abstracts cited to support the level of evidence. Defaulted to empty list  | [optional] [default to undefined] |
| **alterations**     | **Array&lt;string&gt;**                                | List of alterations associated with implication                                    | [optional] [default to undefined] |
| **description**     | **string**                                             | DEPRECATED                                                                         | [optional] [default to undefined] |
| **levelOfEvidence** | **string**                                             | Level associated with implication                                                  | [optional] [default to undefined] |
| **pmids**           | **Array&lt;string&gt;**                                | List of PubMed IDs cited to support the level of evidence. Defaulted to empty list | [optional] [default to undefined] |
| **tumorType**       | [**TumorType**](TumorType.md)                          |                                                                                    | [optional] [default to undefined] |

## Example

```typescript
import { Implication } from './api';

const instance: Implication = {
  abstracts,
  alterations,
  description,
  levelOfEvidence,
  pmids,
  tumorType,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
