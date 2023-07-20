package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
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

    @OneToMany(mappedBy = "parent")
    @JsonIgnoreProperties(value = { "children", "biomarkerAssociations", "parent" }, allowSetters = true)
    private Set<CancerType> children = new HashSet<>();

    @OneToMany(mappedBy = "cancerType")
    @JsonIgnoreProperties(value = { "fdaSubmission", "alteration", "cancerType", "drug" }, allowSetters = true)
    private Set<BiomarkerAssociation> biomarkerAssociations = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "children", "biomarkerAssociations", "parent" }, allowSetters = true)
    private CancerType parent;

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

    public Set<BiomarkerAssociation> getBiomarkerAssociations() {
        return this.biomarkerAssociations;
    }

    public void setBiomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        if (this.biomarkerAssociations != null) {
            this.biomarkerAssociations.forEach(i -> i.setCancerType(null));
        }
        if (biomarkerAssociations != null) {
            biomarkerAssociations.forEach(i -> i.setCancerType(this));
        }
        this.biomarkerAssociations = biomarkerAssociations;
    }

    public CancerType biomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        this.setBiomarkerAssociations(biomarkerAssociations);
        return this;
    }

    public CancerType addBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.add(biomarkerAssociation);
        biomarkerAssociation.setCancerType(this);
        return this;
    }

    public CancerType removeBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.remove(biomarkerAssociation);
        biomarkerAssociation.setCancerType(null);
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
