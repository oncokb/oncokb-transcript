package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * An Association.
 */
@Entity
@Table(name = "association")
public class Association implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @OneToMany(mappedBy = "association", cascade = CascadeType.ALL)
    @JsonIgnoreProperties(value = { "association" }, allowSetters = true)
    private Set<AssociationCancerType> associationCancerTypes = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_association__alteration",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "alteration_id")
    )
    @JsonIgnoreProperties(value = { "transcripts", "associations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_association__article",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "article_id")
    )
    @JsonIgnoreProperties(value = { "associations" }, allowSetters = true)
    private Set<Article> articles = new HashSet<>();

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "rel_association__treatment",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "treatment_id")
    )
    @JsonIgnoreProperties(value = { "treatmentPriorities", "associations" }, allowSetters = true)
    private Set<Treatment> treatments = new HashSet<>();

    @JsonIgnoreProperties(value = { "association", "levelOfEvidences" }, allowSetters = true)
    @OneToOne(mappedBy = "association")
    private Evidence evidence;

    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "clinicalTrialArms", "eligibilityCriteria", "associations" }, allowSetters = true)
    private Set<ClinicalTrial> clinicalTrials = new HashSet<>();

    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<ClinicalTrialArm> clinicalTrialArms = new HashSet<>();

    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<EligibilityCriteria> eligibilityCriteria = new HashSet<>();

    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "companionDiagnosticDevice", "type" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations" }, allowSetters = true)
    private Set<GenomicIndicator> genomicIndicators = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Association id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Association name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<AssociationCancerType> getAssociationCancerTypes() {
        return this.associationCancerTypes;
    }

    public void setAssociationCancerTypes(Set<AssociationCancerType> associationCancerTypes) {
        if (this.associationCancerTypes != null) {
            this.associationCancerTypes.forEach(i -> i.setAssociation(null));
        }
        if (associationCancerTypes != null) {
            associationCancerTypes.forEach(i -> i.setAssociation(this));
        }
        this.associationCancerTypes = associationCancerTypes;
    }

    public Association associationCancerTypes(Set<AssociationCancerType> associationCancerTypes) {
        this.setAssociationCancerTypes(associationCancerTypes);
        return this;
    }

    public Association addAssociationCancerType(AssociationCancerType associationCancerType) {
        this.associationCancerTypes.add(associationCancerType);
        associationCancerType.setAssociation(this);
        return this;
    }

    public Association removeAssociationCancerType(AssociationCancerType associationCancerType) {
        this.associationCancerTypes.remove(associationCancerType);
        associationCancerType.setAssociation(null);
        return this;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        this.alterations = alterations;
    }

    public Association alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Association addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        return this;
    }

    public Association removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        return this;
    }

    public Set<Article> getArticles() {
        return this.articles;
    }

    public void setArticles(Set<Article> articles) {
        this.articles = articles;
    }

    public Association articles(Set<Article> articles) {
        this.setArticles(articles);
        return this;
    }

    public Association addArticle(Article article) {
        this.articles.add(article);
        return this;
    }

    public Association removeArticle(Article article) {
        this.articles.remove(article);
        return this;
    }

    public Set<Treatment> getTreatments() {
        return this.treatments;
    }

    public void setTreatments(Set<Treatment> treatments) {
        this.treatments = treatments;
    }

    public Association treatments(Set<Treatment> treatments) {
        this.setTreatments(treatments);
        return this;
    }

    public Association addTreatment(Treatment treatment) {
        this.treatments.add(treatment);
        return this;
    }

    public Association removeTreatment(Treatment treatment) {
        this.treatments.remove(treatment);
        return this;
    }

    public Evidence getEvidence() {
        return this.evidence;
    }

    public void setEvidence(Evidence evidence) {
        if (this.evidence != null) {
            this.evidence.setAssociation(null);
        }
        if (evidence != null) {
            evidence.setAssociation(this);
        }
        this.evidence = evidence;
    }

    public Association evidence(Evidence evidence) {
        this.setEvidence(evidence);
        return this;
    }

    public Set<ClinicalTrial> getClinicalTrials() {
        return this.clinicalTrials;
    }

    public void setClinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        if (this.clinicalTrials != null) {
            this.clinicalTrials.forEach(i -> i.removeAssociation(this));
        }
        if (clinicalTrials != null) {
            clinicalTrials.forEach(i -> i.addAssociation(this));
        }
        this.clinicalTrials = clinicalTrials;
    }

    public Association clinicalTrials(Set<ClinicalTrial> clinicalTrials) {
        this.setClinicalTrials(clinicalTrials);
        return this;
    }

    public Association addClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrials.add(clinicalTrial);
        return this;
    }

    public Association removeClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrials.remove(clinicalTrial);
        return this;
    }

    public Set<ClinicalTrialArm> getClinicalTrialArms() {
        return this.clinicalTrialArms;
    }

    public void setClinicalTrialArms(Set<ClinicalTrialArm> clinicalTrialArms) {
        if (this.clinicalTrialArms != null) {
            this.clinicalTrialArms.forEach(i -> i.removeAssociation(this));
        }
        if (clinicalTrialArms != null) {
            clinicalTrialArms.forEach(i -> i.addAssociation(this));
        }
        this.clinicalTrialArms = clinicalTrialArms;
    }

    public Association clinicalTrialArms(Set<ClinicalTrialArm> clinicalTrialArms) {
        this.setClinicalTrialArms(clinicalTrialArms);
        return this;
    }

    public Association addClinicalTrialArm(ClinicalTrialArm clinicalTrialArm) {
        this.clinicalTrialArms.add(clinicalTrialArm);
        return this;
    }

    public Association removeClinicalTrialArm(ClinicalTrialArm clinicalTrialArm) {
        this.clinicalTrialArms.remove(clinicalTrialArm);
        return this;
    }

    public Set<EligibilityCriteria> getEligibilityCriteria() {
        return this.eligibilityCriteria;
    }

    public void setEligibilityCriteria(Set<EligibilityCriteria> eligibilityCriteria) {
        if (this.eligibilityCriteria != null) {
            this.eligibilityCriteria.forEach(i -> i.removeAssociation(this));
        }
        if (eligibilityCriteria != null) {
            eligibilityCriteria.forEach(i -> i.addAssociation(this));
        }
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public Association eligibilityCriteria(Set<EligibilityCriteria> eligibilityCriteria) {
        this.setEligibilityCriteria(eligibilityCriteria);
        return this;
    }

    public Association addEligibilityCriteria(EligibilityCriteria eligibilityCriteria) {
        this.eligibilityCriteria.add(eligibilityCriteria);
        return this;
    }

    public Association removeEligibilityCriteria(EligibilityCriteria eligibilityCriteria) {
        this.eligibilityCriteria.remove(eligibilityCriteria);
        return this;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        if (this.fdaSubmissions != null) {
            this.fdaSubmissions.forEach(i -> i.removeAssociation(this));
        }
        if (fdaSubmissions != null) {
            fdaSubmissions.forEach(i -> i.addAssociation(this));
        }
        this.fdaSubmissions = fdaSubmissions;
    }

    public Association fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public Association addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        return this;
    }

    public Association removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        return this;
    }

    public Set<GenomicIndicator> getGenomicIndicators() {
        return this.genomicIndicators;
    }

    public void setGenomicIndicators(Set<GenomicIndicator> genomicIndicators) {
        if (this.genomicIndicators != null) {
            this.genomicIndicators.forEach(i -> i.removeAssociation(this));
        }
        if (genomicIndicators != null) {
            genomicIndicators.forEach(i -> i.addAssociation(this));
        }
        this.genomicIndicators = genomicIndicators;
    }

    public Association genomicIndicators(Set<GenomicIndicator> genomicIndicators) {
        this.setGenomicIndicators(genomicIndicators);
        return this;
    }

    public Association addGenomicIndicator(GenomicIndicator genomicIndicator) {
        this.genomicIndicators.add(genomicIndicator);
        return this;
    }

    public Association removeGenomicIndicator(GenomicIndicator genomicIndicator) {
        this.genomicIndicators.remove(genomicIndicator);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Association)) {
            return false;
        }
        return id != null && id.equals(((Association) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Association{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
