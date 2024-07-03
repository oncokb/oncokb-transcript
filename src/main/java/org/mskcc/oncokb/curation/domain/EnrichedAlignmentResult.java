package org.mskcc.oncokb.curation.domain;

import org.genome_nexus.client.EnsemblTranscript;

/**
 * Created by Hongxin Zhang on 10/23/20.
 */
public class EnrichedAlignmentResult extends AlignmentResult {

    EnsemblTranscript refEnsemblTranscript;
    EnsemblTranscript targetEnsemblTranscript;

    public EnrichedAlignmentResult(AlignmentResult alignmentResult) {
        super(alignmentResult);
        this.refSeq = alignmentResult.refSeq;
        this.targetSeq = alignmentResult.targetSeq;
        this.penalty = alignmentResult.penalty;
    }

    public EnsemblTranscript getRefEnsemblTranscript() {
        return refEnsemblTranscript;
    }

    public void setRefEnsemblTranscript(EnsemblTranscript refEnsemblTranscript) {
        this.refEnsemblTranscript = refEnsemblTranscript;
    }

    public EnsemblTranscript getTargetEnsemblTranscript() {
        return targetEnsemblTranscript;
    }

    public void setTargetEnsemblTranscript(EnsemblTranscript targetEnsemblTranscript) {
        this.targetEnsemblTranscript = targetEnsemblTranscript;
    }
}
