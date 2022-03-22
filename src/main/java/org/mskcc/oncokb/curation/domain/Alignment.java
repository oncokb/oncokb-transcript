package org.mskcc.oncokb.curation.domain;

/**
 * Created by Hongxin Zhang on 10/23/20.
 */
public class Alignment {

    String refSeq;
    String targetSeq;

    public String getRefSeq() {
        return refSeq;
    }

    public void setRefSeq(String refSeq) {
        this.refSeq = refSeq;
    }

    public String getTargetSeq() {
        return targetSeq;
    }

    public void setTargetSeq(String targetSeq) {
        this.targetSeq = targetSeq;
    }
}
