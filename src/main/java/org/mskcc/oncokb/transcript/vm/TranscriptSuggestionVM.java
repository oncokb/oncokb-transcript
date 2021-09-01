package org.mskcc.oncokb.transcript.vm;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptSuggestionVM {

    ReferenceGenome referenceGenome;
    String note = "";
    List<String> suggestions = new ArrayList<>();

    public ReferenceGenome getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
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
