package org.mskcc.oncokb.curation.service.dto.pubmed;

import java.io.Serializable;

public class AbstractTextDTO implements Serializable {

    String label;
    String nlmCategory;
    String value;

    public AbstractTextDTO() {}

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getNlmCategory() {
        return nlmCategory;
    }

    public void setNlmCategory(String nlmCategory) {
        this.nlmCategory = nlmCategory;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
