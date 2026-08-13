package org.mskcc.oncokb.transcript.vm;

/**
 * The canonical protein sequence of a gene, with the ensembl transcript it came from.
 */
public class CanonicalProteinSequenceVM {

    private Integer entrezGeneId;

    private String ensemblTranscriptId;

    private String sequence;

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public String getSequence() {
        return sequence;
    }

    public void setSequence(String sequence) {
        this.sequence = sequence;
    }
}
