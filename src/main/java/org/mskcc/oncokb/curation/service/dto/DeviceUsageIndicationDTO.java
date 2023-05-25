package org.mskcc.oncokb.curation.service.dto;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * A DTO for the {@link org.mskcc.oncokb.curation.domain.DeviceUsageIndication} entity.
 */
public class DeviceUsageIndicationDTO implements Serializable {

    private Long id;

    private Set<Long> alterations = new HashSet<>();

    private Set<Long> drugs = new HashSet<>();

    private Long fdaSubmission;

    private Long cancerType;

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<Long> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Long> alterations) {
        this.alterations = alterations;
    }

    public Set<Long> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Long> drugs) {
        this.drugs = drugs;
    }

    public Long getFdaSubmission() {
        return this.fdaSubmission;
    }

    public void setFdaSubmission(Long fdaSubmission) {
        this.fdaSubmission = fdaSubmission;
    }

    public Long getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(Long cancerType) {
        this.cancerType = cancerType;
    }
}
