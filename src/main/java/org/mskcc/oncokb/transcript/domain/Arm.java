package org.mskcc.oncokb.transcript.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Arm.
 */
@Entity
@Table(name = "arm")
public class Arm implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "description")
    private String description;

    @ManyToMany(mappedBy = "arms")
    @JsonIgnoreProperties(value = { "sites", "arms" }, allowSetters = true)
    private Set<ClinicalTrial> clinicalTrials = new HashSet<>();

    @ManyToMany(mappedBy = "arms")
    @JsonIgnoreProperties(value = { "synonyms", "arms" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Arm id(Long id) {
        this.id = id;
        return this;
    }

    public String getDescription() {
        return this.description;
    }

    public Arm description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<ClinicalTrial> getClinicalTrials() {
        return this.clinicalTrials;
    }

    public Arm clinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        this.setClinicalTrials(clinicalTrials);
        return this;
    }

    public Arm addClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrials.add(clinicalTrial);
        clinicalTrial.getArms().add(this);
        return this;
    }

    public Arm removeClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrials.remove(clinicalTrial);
        clinicalTrial.getArms().remove(this);
        return this;
    }

    public void setClinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        if (this.clinicalTrials != null) {
            this.clinicalTrials.forEach(i -> i.removeArm(this));
        }
        if (clinicalTrials != null) {
            clinicalTrials.forEach(i -> i.addArm(this));
        }
        this.clinicalTrials = clinicalTrials;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public Arm drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public Arm addDrug(Drug drug) {
        this.drugs.add(drug);
        drug.getArms().add(this);
        return this;
    }

    public Arm removeDrug(Drug drug) {
        this.drugs.remove(drug);
        drug.getArms().remove(this);
        return this;
    }

    public void setDrugs(Set<Drug> drugs) {
        if (this.drugs != null) {
            this.drugs.forEach(i -> i.removeArm(this));
        }
        if (drugs != null) {
            drugs.forEach(i -> i.addArm(this));
        }
        this.drugs = drugs;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Arm)) {
            return false;
        }
        return id != null && id.equals(((Arm) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Arm{" +
            "id=" + getId() +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
