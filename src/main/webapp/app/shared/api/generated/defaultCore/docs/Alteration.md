# Alteration

## Properties

| Name                 | Type                                            | Description | Notes                             |
| -------------------- | ----------------------------------------------- | ----------- | --------------------------------- |
| **alteration**       | **string**                                      |             | [optional] [default to undefined] |
| **consequence**      | [**VariantConsequence**](VariantConsequence.md) |             | [optional] [default to undefined] |
| **gene**             | [**Gene**](Gene.md)                             |             | [optional] [default to undefined] |
| **name**             | **string**                                      |             | [optional] [default to undefined] |
| **proteinEnd**       | **number**                                      |             | [optional] [default to undefined] |
| **proteinStart**     | **number**                                      |             | [optional] [default to undefined] |
| **refResidues**      | **string**                                      |             | [optional] [default to undefined] |
| **referenceGenomes** | **Array&lt;string&gt;**                         |             | [optional] [default to undefined] |
| **variantResidues**  | **string**                                      |             | [optional] [default to undefined] |

## Example

```typescript
import { Alteration } from './api';

const instance: Alteration = {
  alteration,
  consequence,
  gene,
  name,
  proteinEnd,
  proteinStart,
  refResidues,
  referenceGenomes,
  variantResidues,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
