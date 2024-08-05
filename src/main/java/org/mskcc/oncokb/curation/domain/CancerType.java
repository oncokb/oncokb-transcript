package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;

/**
 * A CancerType.
 */
@Entity
@Table(name = "cancer_type")
public class CancerType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "code")
    private String code;

    @Column(name = "color")
    private String color;

    @NotNull
    @Column(name = "level", nullable = false)
    private Integer level;

    @NotNull
    @Column(name = "main_type", nullable = false)
    private String mainType;

    @Column(name = "subtype")
    private String subtype;

    @Column(name = "tissue")
    private String tissue;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tumor_form", nullable = false)
    private TumorForm tumorForm;

    @ShallowReference
    @OneToMany(mappedBy = "parent")
    @JsonIgnoreProperties(value = { "children", "synonyms", "parent", "associations" }, allowSetters = true)
    private Set<CancerType> children = new HashSet<>();

    @DiffIgnore
    @ManyToMany
    @JoinTable(
        name = "rel_cancer_type__synonym",
        joinColumns = @JoinColumn(name = "cancer_type_id"),
        inverseJoinColumns = @JoinColumn(name = "synonym_id")
    )
    @JsonIgnoreProperties(value = { "cancerTypes", "genes", "nciThesauruses" }, allowSetters = true)
    private Set<Synonym> synonyms = new HashSet<>();

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "children", "synonyms", "parent", "associations" }, allowSetters = true)
    private CancerType parent;

    @DiffIgnore
    @ManyToMany(mappedBy = "cancerTypes")
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

    public CancerType id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public CancerType code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getColor() {
        return this.color;
    }

    public CancerType color(String color) {
        this.setColor(color);
        return this;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getLevel() {
        return this.level;
    }

    public CancerType level(Integer level) {
        this.setLevel(level);
        return this;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getMainType() {
        return this.mainType;
    }

    public CancerType mainType(String mainType) {
        this.setMainType(mainType);
        return this;
    }

    public void setMainType(String mainType) {
        this.mainType = mainType;
    }

    public String getSubtype() {
        return this.subtype;
    }

    public CancerType subtype(String subtype) {
        this.setSubtype(subtype);
        return this;
    }

    public void setSubtype(String subtype) {
        this.subtype = subtype;
    }

    public String getTissue() {
        return this.tissue;
    }

    public CancerType tissue(String tissue) {
        this.setTissue(tissue);
        return this;
    }

    public void setTissue(String tissue) {
        this.tissue = tissue;
    }

    public TumorForm getTumorForm() {
        return this.tumorForm;
    }

    public CancerType tumorForm(TumorForm tumorForm) {
        this.setTumorForm(tumorForm);
        return this;
    }

    public void setTumorForm(TumorForm tumorForm) {
        this.tumorForm = tumorForm;
    }

    public Set<CancerType> getChildren() {
        return this.children;
    }

    public void setChildren(Set<CancerType> cancerTypes) {
        if (this.children != null) {
            this.children.forEach(i -> i.setParent(null));
        }
        if (cancerTypes != null) {
            cancerTypes.forEach(i -> i.setParent(this));
        }
        this.children = cancerTypes;
    }

    public CancerType children(Set<CancerType> cancerTypes) {
        this.setChildren(cancerTypes);
        return this;
    }

    public CancerType addChildren(CancerType cancerType) {
        this.children.add(cancerType);
        cancerType.setParent(this);
        return this;
    }

    public CancerType removeChildren(CancerType cancerType) {
        this.children.remove(cancerType);
        cancerType.setParent(null);
        return this;
    }

    public Set<Synonym> getSynonyms() {
        return this.synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    public CancerType synonyms(Set<Synonym> synonyms) {
        this.setSynonyms(synonyms);
        return this;
    }

    public CancerType addSynonym(Synonym synonym) {
        this.synonyms.add(synonym);
        synonym.getCancerTypes().add(this);
        return this;
    }

    public CancerType removeSynonym(Synonym synonym) {
        this.synonyms.remove(synonym);
        synonym.getCancerTypes().remove(this);
        return this;
    }

    public CancerType getParent() {
        return this.parent;
    }

    public void setParent(CancerType cancerType) {
        this.parent = cancerType;
    }

    public CancerType parent(CancerType cancerType) {
        this.setParent(cancerType);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        if (this.associations != null) {
            this.associations.forEach(i -> i.removeCancerType(this));
        }
        if (associations != null) {
            associations.forEach(i -> i.addCancerType(this));
        }
        this.associations = associations;
    }

    public CancerType associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public CancerType addAssociation(Association association) {
        this.associations.add(association);
        association.getCancerTypes().add(this);
        return this;
    }

    public CancerType removeAssociation(Association association) {
        this.associations.remove(association);
        association.getCancerTypes().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CancerType)) {
            return false;
        }
        return id != null && id.equals(((CancerType) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CancerType{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", color='" + getColor() + "'" +
            ", level=" + getLevel() +
            ", mainType='" + getMainType() + "'" +
            ", subtype='" + getSubtype() + "'" +
            ", tissue='" + getTissue() + "'" +
            ", tumorForm='" + getTumorForm() + "'" +
            "}";
    }
}
