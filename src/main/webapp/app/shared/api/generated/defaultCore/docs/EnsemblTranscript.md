# EnsemblTranscript

## Properties

| Name              | Type                                                         | Description             | Notes                             |
| ----------------- | ------------------------------------------------------------ | ----------------------- | --------------------------------- |
| **ccdsId**        | **string**                                                   | Consensus CDS (CCDS) ID | [optional] [default to undefined] |
| **exons**         | [**Array&lt;Exon&gt;**](Exon.md)                             | Exon information        | [optional] [default to undefined] |
| **geneId**        | **string**                                                   | Ensembl gene id         | [default to undefined]            |
| **hugoSymbols**   | **Array&lt;string&gt;**                                      | Hugo symbols            | [optional] [default to undefined] |
| **pfamDomains**   | [**Array&lt;PfamDomainRange&gt;**](PfamDomainRange.md)       | Pfam domains            | [optional] [default to undefined] |
| **proteinId**     | **string**                                                   | Ensembl protein id      | [default to undefined]            |
| **proteinLength** | **number**                                                   | Length of protein       | [optional] [default to undefined] |
| **refseqMrnaId**  | **string**                                                   | RefSeq mRNA ID          | [optional] [default to undefined] |
| **transcriptId**  | **string**                                                   | Ensembl transcript id   | [default to undefined]            |
| **uniprotId**     | **string**                                                   |                         | [optional] [default to undefined] |
| **utrs**          | [**Array&lt;UntranslatedRegion&gt;**](UntranslatedRegion.md) | UTR information         | [optional] [default to undefined] |

## Example

```typescript
import { EnsemblTranscript } from './api';

const instance: EnsemblTranscript = {
  ccdsId,
  exons,
  geneId,
  hugoSymbols,
  pfamDomains,
  proteinId,
  proteinLength,
  refseqMrnaId,
  transcriptId,
  uniprotId,
  utrs,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
