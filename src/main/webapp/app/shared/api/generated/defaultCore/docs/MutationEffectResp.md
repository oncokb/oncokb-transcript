# MutationEffectResp

## Properties

| Name            | Type                          | Description                                                                                         | Notes                             |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------- |
| **citations**   | [**Citations**](Citations.md) |                                                                                                     | [optional] [default to undefined] |
| **description** | **string**                    | A brief overview of the biological and oncogenic effect of the variant. Defaulted to \&quot;\&quot; | [optional] [default to undefined] |
| **knownEffect** | **string**                    | Indicates the effect of the mutation on the gene. Defaulted to \&quot;\&quot;                       | [optional] [default to undefined] |

## Example

```typescript
import { MutationEffectResp } from './api';

const instance: MutationEffectResp = {
  citations,
  description,
  knownEffect,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
