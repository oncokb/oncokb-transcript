package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.ShallowReference;

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

    @ShallowReference
    @OneToMany(mappedBy = "association", cascade = CascadeType.ALL)
    @JsonIgnoreProperties(value = { "association" }, allowSetters = true)
    private Set<Rule> rules = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_association__alteration",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "alteration_id")
    )
    @JsonIgnoreProperties(value = { "transcripts", "associations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_association__article",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "article_id")
    )
    @JsonIgnoreProperties(value = { "associations" }, allowSetters = true)
    private Set<Article> articles = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_association__cancer_type",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "cancer_type_id")
    )
    @JsonIgnoreProperties(value = { "children", "synonyms", "parent", "associations" }, allowSetters = true)
    private Set<CancerType> cancerTypes = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_association__drug",
        joinColumns = @JoinColumn(name = "association_id"),
        inverseJoinColumns = @JoinColumn(name = "drug_id")
    )
    @JsonIgnoreProperties(value = { "nciThesaurus", "fdaDrug", "flags", "associations" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    @ShallowReference
    @JsonIgnoreProperties(value = { "association", "gene", "levelOfEvidences" }, allowSetters = true)
    @OneToOne(mappedBy = "association")
    private Evidence evidence;

    @ShallowReference
    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "clinicalTrialArms", "eligibilityCriteria", "associations" }, allowSetters = true)
    private Set<ClinicalTrial> clinicalTrials = new HashSet<>();

    @ShallowReference
    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<ClinicalTrialArm> clinicalTrialArms = new HashSet<>();

    @ShallowReference
    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "clinicalTrial" }, allowSetters = true)
    private Set<EligibilityCriteria> eligibilityCriteria = new HashSet<>();

    @ShallowReference
    @ManyToMany(mappedBy = "associations")
    @JsonIgnoreProperties(value = { "associations", "companionDiagnosticDevice" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ShallowReference
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

    public Set<Rule> getRules() {
        return this.rules;
    }

    public void setRules(Set<Rule> rules) {
        if (this.rules != null) {
            this.rules.forEach(i -> i.setAssociation(null));
        }
        if (rules != null) {
            rules.forEach(i -> i.setAssociation(this));
        }
        this.rules = rules;
    }

    public Association rules(Set<Rule> rules) {
        this.setRules(rules);
        return this;
    }

    public Association addRule(Rule rule) {
        this.rules.add(rule);
        rule.setAssociation(this);
        return this;
    }

    public Association removeRule(Rule rule) {
        this.rules.remove(rule);
        rule.setAssociation(null);
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
        alteration.getAssociations().add(this);
        return this;
    }

    public Association removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getAssociations().remove(this);
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
        article.getAssociations().add(this);
        return this;
    }

    public Association removeArticle(Article article) {
        this.articles.remove(article);
        article.getAssociations().remove(this);
        return this;
    }

    public Set<CancerType> getCancerTypes() {
        return this.cancerTypes;
    }

    public void setCancerTypes(Set<CancerType> cancerTypes) {
        this.cancerTypes = cancerTypes;
    }

    public Association cancerTypes(Set<CancerType> cancerTypes) {
        this.setCancerTypes(cancerTypes);
        return this;
    }

    public Association addCancerType(CancerType cancerType) {
        this.cancerTypes.add(cancerType);
        cancerType.getAssociations().add(this);
        return this;
    }

    public Association removeCancerType(CancerType cancerType) {
        this.cancerTypes.remove(cancerType);
        cancerType.getAssociations().remove(this);
        return this;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        this.drugs = drugs;
    }

    public Association drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public Association addDrug(Drug drug) {
        this.drugs.add(drug);
        drug.getAssociations().add(this);
        return this;
    }

    public Association removeDrug(Drug drug) {
        this.drugs.remove(drug);
        drug.getAssociations().remove(this);
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
        clinicalTrial.getAssociations().add(this);
        return this;
    }

    public Association removeClinicalTrial(ClinicalTrial clinicalTrial) {
        this.clinicalTrials.remove(clinicalTrial);
        clinicalTrial.getAssociations().remove(this);
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
        clinicalTrialArm.getAssociations().add(this);
        return this;
    }

    public Association removeClinicalTrialArm(ClinicalTrialArm clinicalTrialArm) {
        this.clinicalTrialArms.remove(clinicalTrialArm);
        clinicalTrialArm.getAssociations().remove(this);
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
        eligibilityCriteria.getAssociations().add(this);
        return this;
    }

    public Association removeEligibilityCriteria(EligibilityCriteria eligibilityCriteria) {
        this.eligibilityCriteria.remove(eligibilityCriteria);
        eligibilityCriteria.getAssociations().remove(this);
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
        fdaSubmission.getAssociations().add(this);
        return this;
    }

    public Association removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.getAssociations().remove(this);
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
        genomicIndicator.getAssociations().add(this);
        return this;
    }

    public Association removeGenomicIndicator(GenomicIndicator genomicIndicator) {
        this.genomicIndicators.remove(genomicIndicator);
        genomicIndicator.getAssociations().remove(this);
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
