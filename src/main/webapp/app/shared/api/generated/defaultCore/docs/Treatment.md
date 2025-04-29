# Treatment

## Properties

| Name                    | Type                                               | Description | Notes                             |
| ----------------------- | -------------------------------------------------- | ----------- | --------------------------------- |
| **approvedIndications** | **Array&lt;string&gt;**                            |             | [optional] [default to undefined] |
| **drugs**               | [**Array&lt;TreatmentDrug&gt;**](TreatmentDrug.md) |             | [optional] [default to undefined] |
| **priority**            | **number**                                         |             | [optional] [default to undefined] |

## Example

```typescript
import { Treatment } from './api';

const instance: Treatment = {
  approvedIndications,
  drugs,
  priority,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
