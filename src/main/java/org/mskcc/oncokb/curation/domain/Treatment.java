package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A Treatment.
 */
@Entity
@Table(name = "treatment")
public class Treatment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @ShallowReference
    @OneToMany(mappedBy = "treatment")
    @JsonIgnoreProperties(value = { "treatment" }, allowSetters = true)
    private Set<TreatmentPriority> treatmentPriorities = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_treatment__drug",
        joinColumns = @JoinColumn(name = "treatment_id"),
        inverseJoinColumns = @JoinColumn(name = "drug_id")
    )
    @JsonIgnoreProperties(value = { "nciThesaurus", "brands", "drugPriorities", "flags", "fdaDrug", "treatments" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "treatments")
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

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Treatment id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Treatment name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<TreatmentPriority> getTreatmentPriorities() {
        return this.treatmentPriorities;
    }

    public void setTreatmentPriorities(Set<TreatmentPriority> treatmentPriorities) {
        if (this.treatmentPriorities != null) {
            this.treatmentPriorities.forEach(i -> i.setTreatment(null));
        }
        this.treatmentPriorities = treatmentPriorities;
    }

    public Treatment treatmentPriorities(Set<TreatmentPriority> treatmentPriorities) {
        this.setTreatmentPriorities(treatmentPriorities);
        return this;
    }

    public Treatment addTreatmentPriority(TreatmentPriority treatmentPriority) {
        this.treatmentPriorities.add(treatmentPriority);
        return this;
    }

    public Treatment removeTreatmentPriority(TreatmentPriority treatmentPriority) {
        this.treatmentPriorities.remove(treatmentPriority);
        return this;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        this.drugs = drugs;
    }

    public Treatment drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public Treatment addDrug(Drug drug) {
        this.drugs.add(drug);
        return this;
    }

    public Treatment removeDrug(Drug drug) {
        this.drugs.remove(drug);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        if (this.associations != null) {
            this.associations.forEach(i -> i.removeTreatment(this));
        }
        this.associations = associations;
    }

    public Treatment associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public Treatment addAssociation(Association association) {
        this.associations.add(association);
        return this;
    }

    public Treatment removeAssociation(Association association) {
        this.associations.remove(association);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Treatment)) {
            return false;
        }
        return id != null && id.equals(((Treatment) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Treatment{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
