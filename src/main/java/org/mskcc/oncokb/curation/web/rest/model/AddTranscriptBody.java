package org.mskcc.oncokb.curation.web.rest.model;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.mskcc.oncokb.curation.domain.enumeration.TranscriptFlagEnum;

public class AddTranscriptBody {

    @NotNull
    Integer entrezGeneId;

    @NotNull
    String referenceGenome;

    @NotNull
    String ensemblTranscriptId;

    @NotNull
    Boolean isCanonical = false;

    @NotNull
    List<TranscriptFlagEnum> flags;

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

    public List<TranscriptFlagEnum> getFlags() {
        return flags;
    }

    public void setFlags(List<TranscriptFlagEnum> flags) {
        this.flags = flags;
    }
}
