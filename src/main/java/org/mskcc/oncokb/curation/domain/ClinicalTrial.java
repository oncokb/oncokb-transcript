package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A ClinicalTrial.
 */
@Entity
@Table(name = "clinical_trial")
public class ClinicalTrial implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nct_id")
    private String nctId;

    @NotNull
    @Column(name = "brief_title", nullable = false)
    private String briefTitle;

    @Column(name = "phase")
    private String phase;

    @Column(name = "status")
    private String status;

    @ShallowReference
    @OneToMany(mappedBy = "clinicalTrial")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<ClinicalTrialArm> clinicalTrialArms = new HashSet<>();

    @ShallowReference
    @OneToMany(mappedBy = "clinicalTrial")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<EligibilityCriteria> eligibilityCriteria = new HashSet<>();

    @ShallowReference
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "rel_clinical_trial__association",
        joinColumns = @JoinColumn(name = "clinical_trial_id"),
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

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ClinicalTrial id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNctId() {
        return this.nctId;
    }

    public ClinicalTrial nctId(String nctId) {
        this.setNctId(nctId);
        return this;
    }

    public void setNctId(String nctId) {
        this.nctId = nctId;
    }

    public String getBriefTitle() {
        return this.briefTitle;
    }

    public ClinicalTrial briefTitle(String briefTitle) {
        this.setBriefTitle(briefTitle);
        return this;
    }

    public void setBriefTitle(String briefTitle) {
        this.briefTitle = briefTitle;
    }

    public String getPhase() {
        return this.phase;
    }

    public ClinicalTrial phase(String phase) {
        this.setPhase(phase);
        return this;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getStatus() {
        return this.status;
    }

    public ClinicalTrial status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Set<ClinicalTrialArm> getClinicalTrialArms() {
        return this.clinicalTrialArms;
    }

    public void setClinicalTrialArms(Set<ClinicalTrialArm> clinicalTrialArms) {
        if (this.clinicalTrialArms != null) {
            this.clinicalTrialArms.forEach(i -> i.setClinicalTrial(null));
        }
        if (clinicalTrialArms != null) {
            clinicalTrialArms.forEach(i -> i.setClinicalTrial(this));
        }
        this.clinicalTrialArms = clinicalTrialArms;
    }

    public ClinicalTrial clinicalTrialArms(Set<ClinicalTrialArm> clinicalTrialArms) {
        this.setClinicalTrialArms(clinicalTrialArms);
        return this;
    }

    public ClinicalTrial addClinicalTrialArm(ClinicalTrialArm clinicalTrialArm) {
        this.clinicalTrialArms.add(clinicalTrialArm);
        clinicalTrialArm.setClinicalTrial(this);
        return this;
    }

    public ClinicalTrial removeClinicalTrialArm(ClinicalTrialArm clinicalTrialArm) {
        this.clinicalTrialArms.remove(clinicalTrialArm);
        clinicalTrialArm.setClinicalTrial(null);
        return this;
    }

    public Set<EligibilityCriteria> getEligibilityCriteria() {
        return this.eligibilityCriteria;
    }

    public void setEligibilityCriteria(Set<EligibilityCriteria> eligibilityCriteria) {
        if (this.eligibilityCriteria != null) {
            this.eligibilityCriteria.forEach(i -> i.setClinicalTrial(null));
        }
        if (eligibilityCriteria != null) {
            eligibilityCriteria.forEach(i -> i.setClinicalTrial(this));
        }
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public ClinicalTrial eligibilityCriteria(Set<EligibilityCriteria> eligibilityCriteria) {
        this.setEligibilityCriteria(eligibilityCriteria);
        return this;
    }

    public ClinicalTrial addEligibilityCriteria(EligibilityCriteria eligibilityCriteria) {
        this.eligibilityCriteria.add(eligibilityCriteria);
        eligibilityCriteria.setClinicalTrial(this);
        return this;
    }

    public ClinicalTrial removeEligibilityCriteria(EligibilityCriteria eligibilityCriteria) {
        this.eligibilityCriteria.remove(eligibilityCriteria);
        eligibilityCriteria.setClinicalTrial(null);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        this.associations = associations;
    }

    public ClinicalTrial associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public ClinicalTrial addAssociation(Association association) {
        this.associations.add(association);
        association.getClinicalTrials().add(this);
        return this;
    }

    public ClinicalTrial removeAssociation(Association association) {
        this.associations.remove(association);
        association.getClinicalTrials().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClinicalTrial)) {
            return false;
        }
        return id != null && id.equals(((ClinicalTrial) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrial{" +
            "id=" + getId() +
            ", nctId='" + getNctId() + "'" +
            ", briefTitle='" + getBriefTitle() + "'" +
            ", phase='" + getPhase() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
