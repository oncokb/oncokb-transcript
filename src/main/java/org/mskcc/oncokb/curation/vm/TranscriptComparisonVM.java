package org.mskcc.oncokb.curation.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptComparisonVM {

    Boolean align = false;
    TranscriptPairVM transcriptA;
    TranscriptPairVM transcriptB;

    public Boolean getAlign() {
        return align;
    }

    public void setAlign(Boolean align) {
        this.align = align;
    }

    public TranscriptPairVM getTranscriptA() {
        return transcriptA;
    }

    public void setTranscriptA(TranscriptPairVM transcriptA) {
        this.transcriptA = transcriptA;
    }

    public TranscriptPairVM getTranscriptB() {
        return transcriptB;
    }

    public void setTranscriptB(TranscriptPairVM transcriptB) {
        this.transcriptB = transcriptB;
    }
}
