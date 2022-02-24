package org.mskcc.oncokb.transcript.web.rest.model;

import javax.validation.constraints.NotNull;

public class AddTranscriptBody {

    @NotNull
    Integer entrezGeneId;

    @NotNull
    String referenceGenome;

    @NotNull
    String ensemblTranscriptId;

    @NotNull
    Boolean isCanonical = false;

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(String referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public Boolean getCanonical() {
        return isCanonical;
    }

    public void setCanonical(Boolean canonical) {
        isCanonical = canonical;
    }
}
