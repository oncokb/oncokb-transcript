# Evidence

## Properties

| Name                       | Type                                         | Description | Notes                             |
| -------------------------- | -------------------------------------------- | ----------- | --------------------------------- |
| **additionalInfo**         | **string**                                   |             | [optional] [default to undefined] |
| **alterations**            | [**Array&lt;Alteration&gt;**](Alteration.md) |             | [optional] [default to undefined] |
| **articles**               | [**Array&lt;Article&gt;**](Article.md)       |             | [optional] [default to undefined] |
| **cancerTypes**            | [**Array&lt;TumorType&gt;**](TumorType.md)   |             | [optional] [default to undefined] |
| **description**            | **string**                                   |             | [optional] [default to undefined] |
| **evidenceType**           | **string**                                   |             | [optional] [default to undefined] |
| **excludedCancerTypes**    | [**Array&lt;TumorType&gt;**](TumorType.md)   |             | [optional] [default to undefined] |
| **fdaLevel**               | **string**                                   |             | [optional] [default to undefined] |
| **gene**                   | [**Gene**](Gene.md)                          |             | [optional] [default to undefined] |
| **id**                     | **number**                                   |             | [optional] [default to undefined] |
| **knownEffect**            | **string**                                   |             | [optional] [default to undefined] |
| **lastEdit**               | **string**                                   |             | [optional] [default to undefined] |
| **lastReview**             | **string**                                   |             | [optional] [default to undefined] |
| **levelOfEvidence**        | **string**                                   |             | [optional] [default to undefined] |
| **liquidPropagationLevel** | **string**                                   |             | [optional] [default to undefined] |
| **relevantCancerTypes**    | [**Array&lt;TumorType&gt;**](TumorType.md)   |             | [optional] [default to undefined] |
| **solidPropagationLevel**  | **string**                                   |             | [optional] [default to undefined] |
| **treatments**             | [**Array&lt;Treatment&gt;**](Treatment.md)   |             | [optional] [default to undefined] |
| **uuid**                   | **string**                                   |             | [optional] [default to undefined] |

## Example

```typescript
import { Evidence } from './api';

const instance: Evidence = {
  additionalInfo,
  alterations,
  articles,
  cancerTypes,
  description,
  evidenceType,
  excludedCancerTypes,
  fdaLevel,
  gene,
  id,
  knownEffect,
  lastEdit,
  lastReview,
  levelOfEvidence,
  liquidPropagationLevel,
  relevantCancerTypes,
  solidPropagationLevel,
  treatments,
  uuid,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
