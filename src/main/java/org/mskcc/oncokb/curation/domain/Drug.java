package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

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
    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

    @Lob
    @Column(name = "semantic_type")
    private String semanticType;

    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    @OneToOne
    @JoinColumn(unique = true)
    private FdaDrug fdaDrug;

    @OneToMany(mappedBy = "drug", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    private Set<DrugSynonym> synonyms = new HashSet<>();

    @OneToMany(mappedBy = "drug", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "drug" }, allowSetters = true)
    private Set<DrugBrand> brands = new HashSet<>();

    @ManyToMany(mappedBy = "drugs", fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "alterations", "drugs", "fdaSubmission", "cancerType" }, allowSetters = true)
    private Set<BiomarkerAssociation> biomarkerAssociations = new HashSet<>();

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

    public String getCode() {
        return this.code;
    }

    public Drug code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSemanticType() {
        return this.semanticType;
    }

    public Drug semanticType(String semanticType) {
        this.setSemanticType(semanticType);
        return this;
    }

    public void setSemanticType(String semanticType) {
        this.semanticType = semanticType;
    }

    public FdaDrug getFdaDrug() {
        return this.fdaDrug;
    }

    public void setFdaDrug(FdaDrug fdaDrug) {
        this.fdaDrug = fdaDrug;
    }

    public Drug fdaDrug(FdaDrug fdaDrug) {
        this.setFdaDrug(fdaDrug);
        return this;
    }

    public Set<DrugSynonym> getSynonyms() {
        return this.synonyms;
    }

    public void setSynonyms(Set<DrugSynonym> drugSynonyms) {
        if (this.synonyms != null) {
            this.synonyms.forEach(i -> i.setDrug(null));
        }
        if (drugSynonyms != null) {
            drugSynonyms.forEach(i -> i.setDrug(this));
        }
        this.synonyms = drugSynonyms;
    }

    public Drug synonyms(Set<DrugSynonym> drugSynonyms) {
        this.setSynonyms(drugSynonyms);
        return this;
    }

    public Drug addSynonyms(DrugSynonym drugSynonym) {
        this.synonyms.add(drugSynonym);
        drugSynonym.setDrug(this);
        return this;
    }

    public Drug removeSynonyms(DrugSynonym drugSynonym) {
        this.synonyms.remove(drugSynonym);
        drugSynonym.setDrug(null);
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

    public Set<BiomarkerAssociation> getBiomarkerAssociations() {
        return this.biomarkerAssociations;
    }

    public void setBiomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        if (this.biomarkerAssociations != null) {
            this.biomarkerAssociations.forEach(i -> i.removeDrug(this));
        }
        if (biomarkerAssociations != null) {
            biomarkerAssociations.forEach(i -> i.addDrug(this));
        }
        this.biomarkerAssociations = biomarkerAssociations;
    }

    public Drug biomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        this.setBiomarkerAssociations(biomarkerAssociations);
        return this;
    }

    public Drug addBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.add(biomarkerAssociation);
        biomarkerAssociation.getDrugs().add(this);
        return this;
    }

    public Drug removeBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.remove(biomarkerAssociation);
        biomarkerAssociation.getDrugs().remove(this);
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
            ", code='" + getCode() + "'" +
            ", semanticType='" + getSemanticType() + "'" +
            "}";
    }
}
