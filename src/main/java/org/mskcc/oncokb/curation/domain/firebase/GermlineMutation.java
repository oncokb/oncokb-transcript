package org.mskcc.oncokb.curation.domain.firebase;

public class GermlineMutation {

    String pathogenic;
    String penetrance;
    String inheritanceMechanism;
    String cancerRisk;

    public String getPathogenic() {
        return pathogenic;
    }

    public void setPathogenic(String pathogenic) {
        this.pathogenic = pathogenic;
    }

    public String getPenetrance() {
        return penetrance;
    }

    public void setPenetrance(String penetrance) {
        this.penetrance = penetrance;
    }

    public String getInheritanceMechanism() {
        return inheritanceMechanism;
    }

    public void setInheritanceMechanism(String inheritanceMechanism) {
        this.inheritanceMechanism = inheritanceMechanism;
    }

    public String getCancerRisk() {
        return cancerRisk;
    }

    public void setCancerRisk(String cancerRisk) {
        this.cancerRisk = cancerRisk;
    }
}
