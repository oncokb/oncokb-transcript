package org.mskcc.oncokb.curation.importer.model;

public class OncokbTranscript {

    Integer entrezGeneId;
    String grch37refSeq;
    String grch37EnsemblTranscript;
    String grch38refSeq;
    String grch38EnsemblTranscript;

    public OncokbTranscript() {}

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getGrch37refSeq() {
        return grch37refSeq;
    }

    public void setGrch37refSeq(String grch37refSeq) {
        this.grch37refSeq = grch37refSeq;
    }

    public String getGrch37EnsemblTranscript() {
        return grch37EnsemblTranscript;
    }

    public void setGrch37EnsemblTranscript(String grch37EnsemblTranscript) {
        this.grch37EnsemblTranscript = grch37EnsemblTranscript;
    }

    public String getGrch38refSeq() {
        return grch38refSeq;
    }

    public void setGrch38refSeq(String grch38refSeq) {
        this.grch38refSeq = grch38refSeq;
    }

    public String getGrch38EnsemblTranscript() {
        return grch38EnsemblTranscript;
    }

    public void setGrch38EnsemblTranscript(String grch38EnsemblTranscript) {
        this.grch38EnsemblTranscript = grch38EnsemblTranscript;
    }

    @Override
    public String toString() {
        return (
            "OncokbTranscript{" +
            "entrezGeneId=" +
            entrezGeneId +
            ", grch37refSeq='" +
            grch37refSeq +
            '\'' +
            ", grch37EnsemblTranscript='" +
            grch37EnsemblTranscript +
            '\'' +
            ", grch38refSeq='" +
            grch38refSeq +
            '\'' +
            ", grch38EnsemblTranscript='" +
            grch38EnsemblTranscript +
            '\'' +
            '}'
        );
    }
}
