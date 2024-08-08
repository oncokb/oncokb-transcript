package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A ClinicalTrialArm.
 */
@Entity
@Table(name = "clinical_trial_arm")
public class ClinicalTrialArm implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @ShallowReference
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "rel_clinical_trial_arm__association",
        joinColumns = @JoinColumn(name = "clinical_trial_arm_id"),
        inverseJoinColumns = @JoinColumn(name = "association_id")
    )
    @JsonIgnoreProperties(
        value = {
            "rules",
            "alterations",
            "articles",
            "cancerTypes",
            "drugs",
            "evidence",
            "clinicalTrials",
            "clinicalTrialArms",
            "eligibilityCriteria",
            "fdaSubmissions",
            "genomicIndicators",
        },
        allowSetters = true
    )
    private Set<Association> associations = new HashSet<>();

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "clinicalTrialArms", "eligibilityCriteria", "associations" }, allowSetters = true)
    private ClinicalTrial clinicalTrial;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ClinicalTrialArm id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public ClinicalTrialArm name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        this.associations = associations;
    }

    public ClinicalTrialArm associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public ClinicalTrialArm addAssociation(Association association) {
        this.associations.add(association);
        association.getClinicalTrialArms().add(this);
        return this;
    }

    public ClinicalTrialArm removeAssociation(Association association) {
        this.associations.remove(association);
        association.getClinicalTrialArms().remove(this);
        return this;
    }

    public ClinicalTrial getClinicalTrial() {
        return this.clinicalTrial;
    }

    public void setClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrial = clinicalTrial;
    }

    public ClinicalTrialArm clinicalTrial(ClinicalTrial clinicalTrial) {
        this.setClinicalTrial(clinicalTrial);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClinicalTrialArm)) {
            return false;
        }
        return id != null && id.equals(((ClinicalTrialArm) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrialArm{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
