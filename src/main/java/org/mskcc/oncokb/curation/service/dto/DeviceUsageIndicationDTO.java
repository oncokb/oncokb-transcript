package org.mskcc.oncokb.curation.service.dto;

import java.io.Serializable;

/**
 * A DTO for the {@link org.mskcc.oncokb.curation.domain.DeviceUsageIndication} entity.
 */
public class DeviceUsageIndicationDTO implements Serializable {

    private Long id;

    private Long fdaSubmission;

    private Long alteration;

    private Long cancerType;

    private Long drug;

    public DeviceUsageIndicationDTO() {}

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFdaSubmission() {
        return this.fdaSubmission;
    }

    public void setFdaSubmission(Long fdaSubmission) {
        this.fdaSubmission = fdaSubmission;
    }

    public Long getAlteration() {
        return this.alteration;
    }

    public void setAlteration(Long alteration) {
        this.alteration = alteration;
    }

    public Long getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(Long cancerType) {
        this.cancerType = cancerType;
    }

    public Long getDrug() {
        return this.drug;
    }

    public void setDrug(Long drug) {
        this.drug = drug;
    }
}
