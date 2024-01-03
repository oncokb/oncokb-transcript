package org.mskcc.oncokb.curation.domain.firebase;

import com.google.firebase.database.PropertyName;

public class Treatment {

    String description;
    String indication;
    String level;
    String fdaLevel;
    String name;
    String propagation;
    String propagationLiquid;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIndication() {
        return indication;
    }

    public void setIndication(String indication) {
        this.indication = indication;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getFdaLevel() {
        return fdaLevel;
    }

    public void setFdaLevel(String fdaLevel) {
        this.fdaLevel = fdaLevel;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPropagation() {
        return propagation;
    }

    public void setPropagation(String propagation) {
        this.propagation = propagation;
    }

    public String getPropagationLiquid() {
        return propagationLiquid;
    }

    public void setPropagationLiquid(String propagationLiquid) {
        this.propagationLiquid = propagationLiquid;
    }
}
