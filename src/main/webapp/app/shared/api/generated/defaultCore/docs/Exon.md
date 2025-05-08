# Exon

## Properties

| Name          | Type       | Description                             | Notes                  |
| ------------- | ---------- | --------------------------------------- | ---------------------- |
| **exonEnd**   | **number** | End position of exon                    | [default to undefined] |
| **exonId**    | **string** | Exon id                                 | [default to undefined] |
| **exonStart** | **number** | Start position of exon                  | [default to undefined] |
| **rank**      | **number** | Number of exon in transcript            | [default to undefined] |
| **strand**    | **number** | Strand exon is on, -1 for - and 1 for + | [default to undefined] |
| **version**   | **number** | Exon version                            | [default to undefined] |

## Example

```typescript
import { Exon } from './api';

const instance: Exon = {
  exonEnd,
  exonId,
  exonStart,
  rank,
  strand,
  version,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
