package org.mskcc.oncokb.transcript.repository;

public interface CanonicalTranscriptRow {
    Integer getEntrezGeneId();

    String getHugoSymbol();

    String getReferenceGenome();

    String getEnsemblTranscriptId();
}
