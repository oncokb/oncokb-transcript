# VariantAnnotation

## Properties

| Name                                  | Type                                                                         | Description                                                                                                                           | Notes                             |
| ------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **alleleExist**                       | **boolean**                                                                  | Indicates whether the alternate allele has been curated. See SOP Protocol 9.1                                                         | [optional] [default to undefined] |
| **background**                        | **string**                                                                   |                                                                                                                                       | [optional] [default to undefined] |
| **dataVersion**                       | **string**                                                                   | OncoKB data version. See www.oncokb.org/news                                                                                          | [optional] [default to undefined] |
| **diagnosticImplications**            | [**Array&lt;Implication&gt;**](Implication.md)                               | List of diagnostic implications. Defaulted to empty list                                                                              | [optional] [default to undefined] |
| **diagnosticSummary**                 | **string**                                                                   | Diagnostic summary. Defaulted to \&quot;\&quot;                                                                                       | [optional] [default to undefined] |
| **geneExist**                         | **boolean**                                                                  | Indicates whether the gene is curated by OncoKB                                                                                       | [optional] [default to undefined] |
| **geneSummary**                       | **string**                                                                   | Gene summary. Defaulted to \&quot;\&quot;                                                                                             | [optional] [default to undefined] |
| **highestDiagnosticImplicationLevel** | **string**                                                                   | (Nullable) The highest diagnostic level from a list of diagnostic evidences.                                                          | [optional] [default to undefined] |
| **highestFdaLevel**                   | **string**                                                                   | (Nullable) The highest FDA level from a list of therapeutic evidences.                                                                | [optional] [default to undefined] |
| **highestPrognosticImplicationLevel** | **string**                                                                   | (Nullable) The highest prognostic level from a list of prognostic evidences.                                                          | [optional] [default to undefined] |
| **highestResistanceLevel**            | **string**                                                                   | (Nullable) The highest resistance level from a list of therapeutic evidences.                                                         | [optional] [default to undefined] |
| **highestSensitiveLevel**             | **string**                                                                   | (Nullable) The highest sensitivity level from a list of therapeutic evidences.                                                        | [optional] [default to undefined] |
| **hotspot**                           | **boolean**                                                                  | Whether variant is recurrently found in cancer with statistical significance, as defined in Chang et al. (2017). See SOP Protocol 9.2 | [optional] [default to undefined] |
| **lastUpdate**                        | **string**                                                                   | OncoKB data release date. Formatted as MM/DD/YYYY                                                                                     | [optional] [default to undefined] |
| **mutationEffect**                    | [**MutationEffectResp**](MutationEffectResp.md)                              |                                                                                                                                       | [optional] [default to undefined] |
| **oncogenic**                         | **string**                                                                   | The oncogenicity status of the variant. Defaulted to \&quot;Unknown\&quot;.                                                           | [optional] [default to undefined] |
| **otherSignificantResistanceLevels**  | **Array&lt;string&gt;**                                                      | DEPRECATED                                                                                                                            | [optional] [default to undefined] |
| **otherSignificantSensitiveLevels**   | **Array&lt;string&gt;**                                                      | DEPRECATED                                                                                                                            | [optional] [default to undefined] |
| **prognosticImplications**            | [**Array&lt;Implication&gt;**](Implication.md)                               | List of prognostic implications. Defaulted to empty list                                                                              | [optional] [default to undefined] |
| **prognosticSummary**                 | **string**                                                                   | Prognostic summary. Defaulted to \&quot;\&quot;                                                                                       | [optional] [default to undefined] |
| **query**                             | [**Query**](Query.md)                                                        |                                                                                                                                       | [optional] [default to undefined] |
| **treatments**                        | [**Array&lt;IndicatorQueryTreatment&gt;**](IndicatorQueryTreatment.md)       | List of therapeutic implications implications. Defaulted to empty list                                                                | [optional] [default to undefined] |
| **tumorTypeSummary**                  | **string**                                                                   | Tumor type summary. Defaulted to \&quot;\&quot;                                                                                       | [optional] [default to undefined] |
| **tumorTypes**                        | [**Array&lt;VariantAnnotationTumorType&gt;**](VariantAnnotationTumorType.md) |                                                                                                                                       | [optional] [default to undefined] |
| **variantExist**                      | **boolean**                                                                  | Indicates whether an exact match for the queried variant is curated                                                                   | [optional] [default to undefined] |
| **variantSummary**                    | **string**                                                                   | Variant summary. Defaulted to \&quot;\&quot;                                                                                          | [optional] [default to undefined] |
| **vue**                               | **boolean**                                                                  |                                                                                                                                       | [optional] [default to undefined] |
| **vus**                               | **boolean**                                                                  |                                                                                                                                       | [optional] [default to undefined] |

## Example

```typescript
import { VariantAnnotation } from './api';

const instance: VariantAnnotation = {
  alleleExist,
  background,
  dataVersion,
  diagnosticImplications,
  diagnosticSummary,
  geneExist,
  geneSummary,
  highestDiagnosticImplicationLevel,
  highestFdaLevel,
  highestPrognosticImplicationLevel,
  highestResistanceLevel,
  highestSensitiveLevel,
  hotspot,
  lastUpdate,
  mutationEffect,
  oncogenic,
  otherSignificantResistanceLevels,
  otherSignificantSensitiveLevels,
  prognosticImplications,
  prognosticSummary,
  query,
  treatments,
  tumorTypeSummary,
  tumorTypes,
  variantExist,
  variantSummary,
  vue,
  vus,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
