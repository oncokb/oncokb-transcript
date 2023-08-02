package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A ClinicalTrialsGovCondition.
 */
@Entity
@Table(name = "clinical_trials_gov_condition")
public class ClinicalTrialsGovCondition implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @ManyToMany
    @JoinTable(
        name = "rel_clinical_trials_gov_condition__cancer_type",
        joinColumns = @JoinColumn(name = "clinical_trials_gov_condition_id"),
        inverseJoinColumns = @JoinColumn(name = "cancer_type_id")
    )
    @JsonIgnoreProperties(value = { "children", "biomarkerAssociations", "parent", "clinicalTrialsGovConditions" }, allowSetters = true)
    private Set<CancerType> cancerTypes = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ClinicalTrialsGovCondition id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public ClinicalTrialsGovCondition name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<CancerType> getCancerTypes() {
        return this.cancerTypes;
    }

    public void setCancerTypes(Set<CancerType> cancerTypes) {
        this.cancerTypes = cancerTypes;
    }

    public ClinicalTrialsGovCondition cancerTypes(Set<CancerType> cancerTypes) {
        this.setCancerTypes(cancerTypes);
        return this;
    }

    public ClinicalTrialsGovCondition addCancerType(CancerType cancerType) {
        this.cancerTypes.add(cancerType);
        return this;
    }

    public ClinicalTrialsGovCondition removeCancerType(CancerType cancerType) {
        this.cancerTypes.remove(cancerType);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClinicalTrialsGovCondition)) {
            return false;
        }
        return id != null && id.equals(((ClinicalTrialsGovCondition) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrialsGovCondition{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
