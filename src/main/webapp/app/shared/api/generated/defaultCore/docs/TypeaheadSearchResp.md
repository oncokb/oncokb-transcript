# TypeaheadSearchResp

## Properties

| Name                       | Type                                         | Description | Notes                             |
| -------------------------- | -------------------------------------------- | ----------- | --------------------------------- |
| **annotation**             | **string**                                   |             | [optional] [default to undefined] |
| **annotationByLevel**      | **{ [key: string]: string; }**               |             | [optional] [default to undefined] |
| **drug**                   | [**Drug**](Drug.md)                          |             | [optional] [default to undefined] |
| **gene**                   | [**Gene**](Gene.md)                          |             | [optional] [default to undefined] |
| **highestResistanceLevel** | **string**                                   |             | [optional] [default to undefined] |
| **highestSensitiveLevel**  | **string**                                   |             | [optional] [default to undefined] |
| **link**                   | **string**                                   |             | [optional] [default to undefined] |
| **oncogenicity**           | **string**                                   |             | [optional] [default to undefined] |
| **queryType**              | **string**                                   |             | [optional] [default to undefined] |
| **tumorTypes**             | [**Array&lt;TumorType&gt;**](TumorType.md)   |             | [optional] [default to undefined] |
| **variantExist**           | **boolean**                                  |             | [optional] [default to undefined] |
| **variants**               | [**Array&lt;Alteration&gt;**](Alteration.md) |             | [optional] [default to undefined] |
| **vus**                    | **boolean**                                  |             | [optional] [default to undefined] |

## Example

```typescript
import { TypeaheadSearchResp } from './api';

const instance: TypeaheadSearchResp = {
  annotation,
  annotationByLevel,
  drug,
  gene,
  highestResistanceLevel,
  highestSensitiveLevel,
  link,
  oncogenicity,
  queryType,
  tumorTypes,
  variantExist,
  variants,
  vus,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
