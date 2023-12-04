package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.AssociationCancerTypeRelation;

/**
 * A AssociationCancerType.
 */
@Entity
@Table(name = "association_cancer_type")
public class AssociationCancerType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "relation", nullable = false)
    private AssociationCancerTypeRelation relation;

    @ShallowReference
    @ManyToOne
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
    private Association association;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "associationCancerTypes", "children", "synonyms", "parent" }, allowSetters = true)
    private CancerType cancerType;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AssociationCancerType id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AssociationCancerTypeRelation getRelation() {
        return this.relation;
    }

    public AssociationCancerType relation(AssociationCancerTypeRelation relation) {
        this.setRelation(relation);
        return this;
    }

    public void setRelation(AssociationCancerTypeRelation relation) {
        this.relation = relation;
    }

    public Association getAssociation() {
        return this.association;
    }

    public void setAssociation(Association association) {
        this.association = association;
    }

    public AssociationCancerType association(Association association) {
        this.setAssociation(association);
        return this;
    }

    public CancerType getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(CancerType cancerType) {
        this.cancerType = cancerType;
    }

    public AssociationCancerType cancerType(CancerType cancerType) {
        this.setCancerType(cancerType);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AssociationCancerType)) {
            return false;
        }
        return id != null && id.equals(((AssociationCancerType) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AssociationCancerType{" +
            "id=" + getId() +
            ", relation='" + getRelation() + "'" +
            "}";
    }
}
