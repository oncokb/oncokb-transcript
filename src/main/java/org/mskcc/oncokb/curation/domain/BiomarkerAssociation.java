package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A BiomarkerAssociation.
 */
@Entity
@Table(name = "biomarker_association")
public class BiomarkerAssociation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_biomarker_association__alteration",
        joinColumns = @JoinColumn(name = "biomarker_association_id"),
        inverseJoinColumns = @JoinColumn(name = "alteration_id")
    )
    @JsonIgnoreProperties(value = { "biomarkerAssociations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_biomarker_association__drug",
        joinColumns = @JoinColumn(name = "biomarker_association_id"),
        inverseJoinColumns = @JoinColumn(name = "drug_id")
    )
    @JsonIgnoreProperties(value = { "fdaDrug", "synonyms", "biomarkerAssociations" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_biomarker_association__fda_submission",
        joinColumns = @JoinColumn(name = "biomarker_association_id"),
        inverseJoinColumns = @JoinColumn(name = "fda_submission_id")
    )
    @JsonIgnoreProperties(value = { "companionDiagnosticDevice", "type", "biomarkerAssociations" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "children", "biomarkerAssociations", "parent", "clinicalTrialsGovConditions" }, allowSetters = true)
    private CancerType cancerType;

    @ManyToOne
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes", "biomarkerAssociations", "alterations" }, allowSetters = true)
    private Gene gene;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public BiomarkerAssociation id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        this.alterations = alterations;
    }

    public BiomarkerAssociation alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public BiomarkerAssociation addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getBiomarkerAssociations().add(this);
        return this;
    }

    public BiomarkerAssociation removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getBiomarkerAssociations().remove(this);
        return this;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        this.drugs = drugs;
    }

    public BiomarkerAssociation drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public BiomarkerAssociation addDrug(Drug drug) {
        this.drugs.add(drug);
        drug.getBiomarkerAssociations().add(this);
        return this;
    }

    public BiomarkerAssociation removeDrug(Drug drug) {
        this.drugs.remove(drug);
        drug.getBiomarkerAssociations().remove(this);
        return this;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.fdaSubmissions = fdaSubmissions;
    }

    public BiomarkerAssociation fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public BiomarkerAssociation addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        fdaSubmission.getBiomarkerAssociations().add(this);
        return this;
    }

    public BiomarkerAssociation removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.getBiomarkerAssociations().remove(this);
        return this;
    }

    public CancerType getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(CancerType cancerType) {
        this.cancerType = cancerType;
    }

    public BiomarkerAssociation cancerType(CancerType cancerType) {
        this.setCancerType(cancerType);
        return this;
    }

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public BiomarkerAssociation gene(Gene gene) {
        this.setGene(gene);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BiomarkerAssociation)) {
            return false;
        }
        return id != null && id.equals(((BiomarkerAssociation) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BiomarkerAssociation{" +
            "id=" + getId() +
            "}";
    }
}
