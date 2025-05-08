# Query

Enriched user annotation query

## Properties

| Name                    | Type       | Description                                                                                                                           | Notes                             |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **alteration**          | **string** | (Nullable) Alteration from original query or the resolved alteration from HGVS variant                                                | [optional] [default to undefined] |
| **alterationType**      | **string** | (Nullable) Alteration type                                                                                                            | [optional] [default to undefined] |
| **canonicalTranscript** | **string** | (Nullable) The OncoKB canonical transcript. See https://www.oncokb.org/cancer-genes                                                   | [optional] [default to undefined] |
| **consequence**         | **string** | (Nullable) Variant consequence term from Ensembl. See https://useast.ensembl.org/info/genome/variation/prediction/predicted_data.html | [optional] [default to undefined] |
| **entrezGeneId**        | **number** | (Nullable) Unique gene identifiers from NCBI. May be null if omitted from original query, otherwise filled in by OncoKB               | [optional] [default to undefined] |
| **hgvs**                | **string** | (Nullable) The hgvsg or genomic location from original query                                                                          | [optional] [default to undefined] |
| **hgvsInfo**            | **string** | (Nullable) Additional message for \&quot;hgvs\&quot; field. May indicate reason for failed hgvs annotation.                           | [optional] [default to undefined] |
| **hugoSymbol**          | **string** | (Nullable) The gene symbol used in Human Genome Organisation                                                                          | [optional] [default to undefined] |
| **id**                  | **string** | (Nullable) The id passed in request for the user to distinguish the query.                                                            | [optional] [default to undefined] |
| **proteinEnd**          | **number** | (Nullable) Protein end position                                                                                                       | [optional] [default to undefined] |
| **proteinStart**        | **number** | (Nullable) Protein start position                                                                                                     | [optional] [default to undefined] |
| **referenceGenome**     | **string** | Reference genome build version. Defaulted to GRCh37                                                                                   | [optional] [default to undefined] |
| **svType**              | **string** | (Nullable) Structural variant type                                                                                                    | [optional] [default to undefined] |
| **tumorType**           | **string** | (Nullable) Oncotree tumor type name, code, or main type.                                                                              | [optional] [default to undefined] |

## Example

```typescript
import { Query } from './api';

const instance: Query = {
  alteration,
  alterationType,
  canonicalTranscript,
  consequence,
  entrezGeneId,
  hgvs,
  hgvsInfo,
  hugoSymbol,
  id,
  proteinEnd,
  proteinStart,
  referenceGenome,
  svType,
  tumorType,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
