# IndicatorQueryTreatment

## Properties

| Name                          | Type                                                   | Description                                                                    | Notes                             |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------- |
| **abstracts**                 | [**Array&lt;ArticleAbstract&gt;**](ArticleAbstract.md) | List of abstracts cited in the treatment description. Defaulted to empty list  | [optional] [default to undefined] |
| **alterations**               | **Array&lt;string&gt;**                                | List of alterations associated with therapeutic implication                    | [optional] [default to undefined] |
| **approvedIndications**       | **Array&lt;string&gt;**                                | DEPRECATED                                                                     | [optional] [default to undefined] |
| **description**               | **string**                                             | Treatment description. Defaulted to \&quot;\&quot;                             | [optional] [default to undefined] |
| **drugs**                     | [**Array&lt;Drug&gt;**](Drug.md)                       | List of drugs associated with therapeutic implication                          | [optional] [default to undefined] |
| **fdaLevel**                  | **string**                                             | FDA level associated with implication                                          | [optional] [default to undefined] |
| **level**                     | **string**                                             | Therapeutic level associated with implication                                  | [optional] [default to undefined] |
| **levelAssociatedCancerType** | [**TumorType**](TumorType.md)                          |                                                                                | [optional] [default to undefined] |
| **levelExcludedCancerTypes**  | [**Array&lt;TumorType&gt;**](TumorType.md)             | Excluded cancer types. Defaulted to empty list                                 | [optional] [default to undefined] |
| **pmids**                     | **Array&lt;string&gt;**                                | List of PubMed IDs cited in the treatment description. Defaulted to empty list | [optional] [default to undefined] |

## Example

```typescript
import { IndicatorQueryTreatment } from './api';

const instance: IndicatorQueryTreatment = {
  abstracts,
  alterations,
  approvedIndications,
  description,
  drugs,
  fdaLevel,
  level,
  levelAssociatedCancerType,
  levelExcludedCancerTypes,
  pmids,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
