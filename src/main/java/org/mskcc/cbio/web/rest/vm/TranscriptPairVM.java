package org.mskcc.cbio.web.rest.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptPairVM {
    REFERENCE_GENOME referenceGenome;
    String transcript;

    public REFERENCE_GENOME getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(REFERENCE_GENOME referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }
}
