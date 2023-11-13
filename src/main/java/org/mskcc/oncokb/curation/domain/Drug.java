package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A Drug.
 */
@Entity
@Table(name = "drug")
public class Drug implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "name", nullable = false)
    private String name;

    @JsonIgnoreProperties(value = { "synonyms" }, allowSetters = true)
    @OneToOne
    @JoinColumn(unique = true, name = "ncit_code", referencedColumnName = "code")
    private NciThesaurus nciThesaurus;

    @OneToMany(mappedBy = "drug")
    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    private Set<DrugBrand> brands = new HashSet<>();

    @OneToMany(mappedBy = "drug")
    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    private Set<DrugPriority> drugPriorities = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "rel_drug__flag", joinColumns = @JoinColumn(name = "drug_id"), inverseJoinColumns = @JoinColumn(name = "flag_id"))
    @JsonIgnoreProperties(value = { "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    @OneToOne(mappedBy = "drug")
    private FdaDrug fdaDrug;

    @ManyToMany(mappedBy = "drugs")
    @JsonIgnoreProperties(value = { "treatmentPriorities", "drugs", "associations" }, allowSetters = true)
    private Set<Treatment> treatments = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Drug id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Drug name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public NciThesaurus getNciThesaurus() {
        return this.nciThesaurus;
    }

    public void setNciThesaurus(NciThesaurus nciThesaurus) {
        this.nciThesaurus = nciThesaurus;
    }

    public Drug nciThesaurus(NciThesaurus nciThesaurus) {
        this.setNciThesaurus(nciThesaurus);
        return this;
    }

    public Set<DrugBrand> getBrands() {
        return this.brands;
    }

    public void setBrands(Set<DrugBrand> drugBrands) {
        if (this.brands != null) {
            this.brands.forEach(i -> i.setDrug(null));
        }
        if (drugBrands != null) {
            drugBrands.forEach(i -> i.setDrug(this));
        }
        this.brands = drugBrands;
    }

    public Drug brands(Set<DrugBrand> drugBrands) {
        this.setBrands(drugBrands);
        return this;
    }

    public Drug addBrands(DrugBrand drugBrand) {
        this.brands.add(drugBrand);
        drugBrand.setDrug(this);
        return this;
    }

    public Drug removeBrands(DrugBrand drugBrand) {
        this.brands.remove(drugBrand);
        drugBrand.setDrug(null);
        return this;
    }

    public Set<DrugPriority> getDrugPriorities() {
        return this.drugPriorities;
    }

    public void setDrugPriorities(Set<DrugPriority> drugPriorities) {
        if (this.drugPriorities != null) {
            this.drugPriorities.forEach(i -> i.setDrug(null));
        }
        if (drugPriorities != null) {
            drugPriorities.forEach(i -> i.setDrug(this));
        }
        this.drugPriorities = drugPriorities;
    }

    public Drug drugPriorities(Set<DrugPriority> drugPriorities) {
        this.setDrugPriorities(drugPriorities);
        return this;
    }

    public Drug addDrugPriority(DrugPriority drugPriority) {
        this.drugPriorities.add(drugPriority);
        drugPriority.setDrug(this);
        return this;
    }

    public Drug removeDrugPriority(DrugPriority drugPriority) {
        this.drugPriorities.remove(drugPriority);
        drugPriority.setDrug(null);
        return this;
    }

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Drug flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Drug addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getDrugs().add(this);
        return this;
    }

    public Drug removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getDrugs().remove(this);
        return this;
    }

    public FdaDrug getFdaDrug() {
        return this.fdaDrug;
    }

    public void setFdaDrug(FdaDrug fdaDrug) {
        if (this.fdaDrug != null) {
            this.fdaDrug.setDrug(null);
        }
        if (fdaDrug != null) {
            fdaDrug.setDrug(this);
        }
        this.fdaDrug = fdaDrug;
    }

    public Drug fdaDrug(FdaDrug fdaDrug) {
        this.setFdaDrug(fdaDrug);
        return this;
    }

    public Set<Treatment> getTreatments() {
        return this.treatments;
    }

    public void setTreatments(Set<Treatment> treatments) {
        if (this.treatments != null) {
            this.treatments.forEach(i -> i.removeDrug(this));
        }
        if (treatments != null) {
            treatments.forEach(i -> i.addDrug(this));
        }
        this.treatments = treatments;
    }

    public Drug treatments(Set<Treatment> treatments) {
        this.setTreatments(treatments);
        return this;
    }

    public Drug addTreatment(Treatment treatment) {
        this.treatments.add(treatment);
        treatment.getDrugs().add(this);
        return this;
    }

    public Drug removeTreatment(Treatment treatment) {
        this.treatments.remove(treatment);
        treatment.getDrugs().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Drug)) {
            return false;
        }
        return id != null && id.equals(((Drug) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Drug{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
