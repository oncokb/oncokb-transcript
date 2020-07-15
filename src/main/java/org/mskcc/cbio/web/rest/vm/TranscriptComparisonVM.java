package org.mskcc.cbio.web.rest.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptComparisonVM {
    TranscriptPairVM transcriptA;
    TranscriptPairVM transcriptB;

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
