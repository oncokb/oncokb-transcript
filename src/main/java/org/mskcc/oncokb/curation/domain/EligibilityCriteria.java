package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.EligibilityCriteriaType;

/**
 * A EligibilityCriteria.
 */
@Entity
@Table(name = "eligibility_criteria")
public class EligibilityCriteria implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private EligibilityCriteriaType type;

    @Column(name = "priority")
    private Integer priority;

    @Lob
    @Column(name = "criteria")
    private String criteria;

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_eligibility_criteria__association",
        joinColumns = @JoinColumn(name = "eligibility_criteria_id"),
        inverseJoinColumns = @JoinColumn(name = "association_id")
    )
    @JsonIgnoreProperties(
        value = {
            "associationCancerTypes",
            "alterations",
            "articles",
            "treatments",
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

    @ManyToOne
    @JsonIgnoreProperties(value = { "clinicalTrialArms", "eligibilityCriteria", "associations" }, allowSetters = true)
    private ClinicalTrial clinicalTrial;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public EligibilityCriteria id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EligibilityCriteriaType getType() {
        return this.type;
    }

    public EligibilityCriteria type(EligibilityCriteriaType type) {
        this.setType(type);
        return this;
    }

    public void setType(EligibilityCriteriaType type) {
        this.type = type;
    }

    public Integer getPriority() {
        return this.priority;
    }

    public EligibilityCriteria priority(Integer priority) {
        this.setPriority(priority);
        return this;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getCriteria() {
        return this.criteria;
    }

    public EligibilityCriteria criteria(String criteria) {
        this.setCriteria(criteria);
        return this;
    }

    public void setCriteria(String criteria) {
        this.criteria = criteria;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        this.associations = associations;
    }

    public EligibilityCriteria associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public EligibilityCriteria addAssociation(Association association) {
        this.associations.add(association);
        association.getEligibilityCriteria().add(this);
        return this;
    }

    public EligibilityCriteria removeAssociation(Association association) {
        this.associations.remove(association);
        association.getEligibilityCriteria().remove(this);
        return this;
    }

    public ClinicalTrial getClinicalTrial() {
        return this.clinicalTrial;
    }

    public void setClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrial = clinicalTrial;
    }

    public EligibilityCriteria clinicalTrial(ClinicalTrial clinicalTrial) {
        this.setClinicalTrial(clinicalTrial);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EligibilityCriteria)) {
            return false;
        }
        return id != null && id.equals(((EligibilityCriteria) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EligibilityCriteria{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", priority=" + getPriority() +
            ", criteria='" + getCriteria() + "'" +
            "}";
    }
}
