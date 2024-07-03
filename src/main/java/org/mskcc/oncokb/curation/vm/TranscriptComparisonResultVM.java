package org.mskcc.oncokb.curation.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptComparisonResultVM {

    Boolean match = false;
    String sequenceA;
    String sequenceB;

    public Boolean getMatch() {
        return match;
    }

    public void setMatch(Boolean match) {
        this.match = match;
    }

    public String getSequenceA() {
        return sequenceA;
    }

    public void setSequenceA(String sequenceA) {
        this.sequenceA = sequenceA;
    }

    public String getSequenceB() {
        return sequenceB;
    }

    public void setSequenceB(String sequenceB) {
        this.sequenceB = sequenceB;
    }
}
