package org.mskcc.oncokb.curation.service.dto;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.mskcc.oncokb.curation.domain.Gene;

/**
 * A DTO for the {@link org.mskcc.oncokb.curation.domain.BiomarkerAssociation} entity.
 */
public class BiomarkerAssociationDTO implements Serializable {

    private Long id;

    private Set<Long> alterations = new HashSet<>();

    private Set<Long> drugs = new HashSet<>();

    private Set<Long> fdaSubmissions;

    private Long cancerType;

    private Long gene;

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

    public Set<Long> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<Long> fdaSubmissions) {
        this.fdaSubmissions = fdaSubmissions;
    }

    public Long getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(Long cancerType) {
        this.cancerType = cancerType;
    }

    public Long getGene() {
        return this.gene;
    }

    public void setGene(Long gene) {
        this.gene = gene;
    }
}
