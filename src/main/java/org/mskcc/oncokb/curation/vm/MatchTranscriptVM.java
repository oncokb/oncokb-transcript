package org.mskcc.oncokb.curation.vm;

import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class MatchTranscriptVM {

    TranscriptPairVM transcript;
    ReferenceGenome targetReferenceGenome;

    public TranscriptPairVM getTranscript() {
        return transcript;
    }

    public void setTranscript(TranscriptPairVM transcript) {
        this.transcript = transcript;
    }

    public ReferenceGenome getTargetReferenceGenome() {
        return targetReferenceGenome;
    }

    public void setTargetReferenceGenome(ReferenceGenome targetReferenceGenome) {
        this.targetReferenceGenome = targetReferenceGenome;
    }
}
