package org.mskcc.oncokb.curation.service.dto;

import java.util.Objects;

public class GeneReleaseStatus {

    private String hugoSymbol;
    private String releaseType;

    public GeneReleaseStatus() {}

    public GeneReleaseStatus(String hugoSymbol, String releaseType) {
        this.hugoSymbol = hugoSymbol;
        this.releaseType = releaseType;
    }

    public String getHugoSymbol() {
        return hugoSymbol;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public String getReleaseType() {
        return releaseType;
    }

    public void setReleaseType(String releaseType) {
        this.releaseType = releaseType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GeneReleaseStatus)) {
            return false;
        }
        GeneReleaseStatus that = (GeneReleaseStatus) o;
        return Objects.equals(hugoSymbol, that.hugoSymbol) && Objects.equals(releaseType, that.releaseType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hugoSymbol, releaseType);
    }
}
