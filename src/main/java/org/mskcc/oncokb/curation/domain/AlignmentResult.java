package org.mskcc.oncokb.curation.domain;

/**
 * Created by Hongxin Zhang on 10/23/20.
 */
public class AlignmentResult extends Alignment {

    int penalty;

    public AlignmentResult(Alignment alignment) {
        this.refSeq = alignment.refSeq;
        this.targetSeq = alignment.targetSeq;
    }

    public int getPenalty() {
        return penalty;
    }

    public void setPenalty(int penalty) {
        this.penalty = penalty;
    }
}
