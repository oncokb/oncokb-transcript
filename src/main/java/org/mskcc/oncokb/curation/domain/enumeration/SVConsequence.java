package org.mskcc.oncokb.curation.domain.enumeration;

public enum SVConsequence {
    SV_DELETION("Deletion"),
    SV_TRANSLOCATION("Translocation"),
    SV_DUPLICATION("Duplication"),
    SV_INSERTION("Insertion"),
    SV_INVERSION("Inversion"),
    SV_FUSION("Fusion"),
    SV_UNKNOWN("Unknown");

    private final String name;

    SVConsequence(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
