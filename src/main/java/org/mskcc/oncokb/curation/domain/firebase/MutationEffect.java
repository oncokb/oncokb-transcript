package org.mskcc.oncokb.curation.domain.firebase;

public class MutationEffect {

    String effect;
    String description;
    String oncogenic;
    GermlineMutation germline;

    public String getEffect() {
        return effect;
    }

    public void setEffect(String effect) {
        this.effect = effect;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOncogenic() {
        return oncogenic;
    }

    public void setOncogenic(String oncogenic) {
        this.oncogenic = oncogenic;
    }

    public GermlineMutation getGermline() {
        return germline;
    }

    public void setGermline(GermlineMutation germline) {
        this.germline = germline;
    }
}
