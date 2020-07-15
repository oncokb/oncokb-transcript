package org.mskcc.cbio.web.rest.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class MatchTranscriptVM {
    TranscriptPairVM transcript;
    REFERENCE_GENOME targetReferenceGenome;

    public TranscriptPairVM getTranscript() {
        return transcript;
    }

    public void setTranscript(TranscriptPairVM transcript) {
        this.transcript = transcript;
    }

    public REFERENCE_GENOME getTargetReferenceGenome() {
        return targetReferenceGenome;
    }

    public void setTargetReferenceGenome(REFERENCE_GENOME targetReferenceGenome) {
        this.targetReferenceGenome = targetReferenceGenome;
    }
}
