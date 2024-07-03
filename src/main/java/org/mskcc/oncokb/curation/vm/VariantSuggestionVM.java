package org.mskcc.oncokb.curation.vm;

import org.genome_nexus.client.EnsemblTranscript;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class VariantSuggestionVM {

    EnsemblTranscript transcript;
    String suggestedVariant;

    public VariantSuggestionVM(EnsemblTranscript transcript, String suggestedVariant) {
        this.transcript = transcript;
        this.suggestedVariant = suggestedVariant;
    }

    public EnsemblTranscript getTranscript() {
        return transcript;
    }

    public void setTranscript(EnsemblTranscript transcript) {
        this.transcript = transcript;
    }

    public String getSuggestedVariant() {
        return suggestedVariant;
    }

    public void setSuggestedVariant(String suggestedVariant) {
        this.suggestedVariant = suggestedVariant;
    }
}
