package org.mskcc.oncokb.curation.vm;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class AllReferenceTranscriptSuggestionVM {

    TranscriptSuggestionVM grch37 = new TranscriptSuggestionVM();
    TranscriptSuggestionVM grch38 = new TranscriptSuggestionVM();

    public TranscriptSuggestionVM getGrch37() {
        return grch37;
    }

    public void setGrch37(TranscriptSuggestionVM grch37) {
        this.grch37 = grch37;
    }

    public TranscriptSuggestionVM getGrch38() {
        return grch38;
    }

    public void setGrch38(TranscriptSuggestionVM grch38) {
        this.grch38 = grch38;
    }
}
