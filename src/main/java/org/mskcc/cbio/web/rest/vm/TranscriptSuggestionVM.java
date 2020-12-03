package org.mskcc.cbio.web.rest.vm;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptSuggestionVM {
    REFERENCE_GENOME referenceGenome;
    String note = "";
    List<String> suggestions = new ArrayList<>();

    public REFERENCE_GENOME getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(REFERENCE_GENOME referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
