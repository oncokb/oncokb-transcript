# BiologicalVariant

## Properties

| Name                          | Type                                                   | Description | Notes                             |
| ----------------------------- | ------------------------------------------------------ | ----------- | --------------------------------- |
| **mutationEffect**            | **string**                                             |             | [optional] [default to undefined] |
| **mutationEffectAbstracts**   | [**Array&lt;ArticleAbstract&gt;**](ArticleAbstract.md) |             | [optional] [default to undefined] |
| **mutationEffectDescription** | **string**                                             |             | [optional] [default to undefined] |
| **mutationEffectPmids**       | **Array&lt;string&gt;**                                |             | [optional] [default to undefined] |
| **oncogenic**                 | **string**                                             |             | [optional] [default to undefined] |
| **oncogenicAbstracts**        | [**Array&lt;ArticleAbstract&gt;**](ArticleAbstract.md) |             | [optional] [default to undefined] |
| **oncogenicPmids**            | **Array&lt;string&gt;**                                |             | [optional] [default to undefined] |
| **variant**                   | [**Alteration**](Alteration.md)                        |             | [optional] [default to undefined] |

## Example

```typescript
import { BiologicalVariant } from './api';

const instance: BiologicalVariant = {
  mutationEffect,
  mutationEffectAbstracts,
  mutationEffectDescription,
  mutationEffectPmids,
  oncogenic,
  oncogenicAbstracts,
  oncogenicPmids,
  variant,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
