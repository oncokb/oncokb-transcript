package org.mskcc.oncokb.curation.vm;

import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptPairVM {

    ReferenceGenome referenceGenome;
    String transcript;

    public ReferenceGenome getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }
}
