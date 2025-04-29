# PortalAlteration

## Properties

| Name                     | Type                | Description | Notes                             |
| ------------------------ | ------------------- | ----------- | --------------------------------- |
| **alterationType**       | **string**          |             | [optional] [default to undefined] |
| **cancerStudy**          | **string**          |             | [optional] [default to undefined] |
| **cancerType**           | **string**          |             | [optional] [default to undefined] |
| **gene**                 | [**Gene**](Gene.md) |             | [optional] [default to undefined] |
| **proteinChange**        | **string**          |             | [optional] [default to undefined] |
| **proteinEndPosition**   | **number**          |             | [optional] [default to undefined] |
| **proteinStartPosition** | **number**          |             | [optional] [default to undefined] |
| **sampleId**             | **string**          |             | [optional] [default to undefined] |

## Example

```typescript
import { PortalAlteration } from './api';

const instance: PortalAlteration = {
  alterationType,
  cancerStudy,
  cancerType,
  gene,
  proteinChange,
  proteinEndPosition,
  proteinStartPosition,
  sampleId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
