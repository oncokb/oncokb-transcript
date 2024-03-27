package org.mskcc.oncokb.curation.importer.model;

public class ManeTranscript {

    Integer entrezGeneId;
    String hugoSymbol;
    String ensemblGeneId;
    String refSeqTranscriptId;
    String refSeqProteinId;
    String ensemblTranscriptId;
    String ensemblProteinId;
    String maneStatus;

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return hugoSymbol;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public String getEnsemblGeneId() {
        return ensemblGeneId;
    }

    public void setEnsemblGeneId(String ensemblGeneId) {
        this.ensemblGeneId = ensemblGeneId;
    }

    public String getRefSeqTranscriptId() {
        return refSeqTranscriptId;
    }

    public void setRefSeqTranscriptId(String refSeqTranscriptId) {
        this.refSeqTranscriptId = refSeqTranscriptId;
    }

    public String getRefSeqProteinId() {
        return refSeqProteinId;
    }

    public void setRefSeqProteinId(String refSeqProteinId) {
        this.refSeqProteinId = refSeqProteinId;
    }

    public String getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public String getEnsemblProteinId() {
        return ensemblProteinId;
    }

    public void setEnsemblProteinId(String ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
    }

    public String getManeStatus() {
        return maneStatus;
    }

    public void setManeStatus(String maneStatus) {
        this.maneStatus = maneStatus;
    }

    @Override
    public String toString() {
        return (
            "ManeTranscript{" +
            "entrezGeneId=" +
            entrezGeneId +
            ", hugoSymbol='" +
            hugoSymbol +
            '\'' +
            ", ensemblGeneId='" +
            ensemblGeneId +
            '\'' +
            ", refSeqTranscriptId='" +
            refSeqTranscriptId +
            '\'' +
            ", refSeqProteinId='" +
            refSeqProteinId +
            '\'' +
            ", ensemblTranscriptId='" +
            ensemblTranscriptId +
            '\'' +
            ", ensemblProteinId='" +
            ensemblProteinId +
            '\'' +
            ", maneStatus='" +
            maneStatus +
            '\'' +
            '}'
        );
    }
}
