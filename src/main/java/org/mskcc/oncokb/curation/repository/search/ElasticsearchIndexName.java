package org.mskcc.oncokb.curation.repository.search;

public enum ElasticsearchIndexName {
    ARTICLE("article"),
    COMPANION_DIAGNOSTIC_DEVICE("companiondiagnosticdevice"),
    FDA_SUBMISSION("fdasubmission"),
    CANCER_TYPE("cancertype"),
    DRUG("drug"),
    GENE("gene"),
    ALTERATION("alteration");

    private String name;

    ElasticsearchIndexName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
