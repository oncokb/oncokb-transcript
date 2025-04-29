# ClinicalVariant

## Properties

| Name                       | Type                                                   | Description | Notes                             |
| -------------------------- | ------------------------------------------------------ | ----------- | --------------------------------- |
| **cancerTypes**            | [**Array&lt;TumorType&gt;**](TumorType.md)             |             | [optional] [default to undefined] |
| **drug**                   | **Array&lt;string&gt;**                                |             | [optional] [default to undefined] |
| **drugAbstracts**          | [**Array&lt;ArticleAbstract&gt;**](ArticleAbstract.md) |             | [optional] [default to undefined] |
| **drugDescription**        | **string**                                             |             | [optional] [default to undefined] |
| **drugPmids**              | **Array&lt;string&gt;**                                |             | [optional] [default to undefined] |
| **excludedCancerTypes**    | [**Array&lt;TumorType&gt;**](TumorType.md)             |             | [optional] [default to undefined] |
| **fdaLevel**               | **string**                                             |             | [optional] [default to undefined] |
| **level**                  | **string**                                             |             | [optional] [default to undefined] |
| **liquidPropagationLevel** | **string**                                             |             | [optional] [default to undefined] |
| **oncogenic**              | **string**                                             |             | [optional] [default to undefined] |
| **solidPropagationLevel**  | **string**                                             |             | [optional] [default to undefined] |
| **variant**                | [**Alteration**](Alteration.md)                        |             | [optional] [default to undefined] |

## Example

```typescript
import { ClinicalVariant } from './api';

const instance: ClinicalVariant = {
  cancerTypes,
  drug,
  drugAbstracts,
  drugDescription,
  drugPmids,
  excludedCancerTypes,
  fdaLevel,
  level,
  liquidPropagationLevel,
  oncogenic,
  solidPropagationLevel,
  variant,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
