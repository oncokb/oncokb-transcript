package org.mskcc.oncokb.curation.domain.firebase;

public class Drug {

    String uuid;
    String ncitCode;
    String ncitName;
    String drugName;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getNcitCode() {
        return ncitCode;
    }

    public void setNcitCode(String ncitCode) {
        this.ncitCode = ncitCode;
    }

    public String getNcitName() {
        return ncitName;
    }

    public void setNcitName(String ncitName) {
        this.ncitName = ncitName;
    }

    public String getDrugName() {
        return drugName;
    }

    public void setDrugName(String drugName) {
        this.drugName = drugName;
    }
}
