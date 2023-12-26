package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A Evidence.
 */
@Entity
@Table(name = "evidence")
public class Evidence implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "uuid")
    private String uuid;

    @NotNull
    @Column(name = "evidence_type", nullable = false)
    private String evidenceType;

    @Column(name = "known_effect")
    private String knownEffect;

    @DiffIgnore
    @Lob
    @Column(name = "description")
    private String description;

    @DiffIgnore
    @Lob
    @Column(name = "note")
    private String note;

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
    @ShallowReference
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(unique = true)
    private Association association;

    @ManyToMany
    @JoinTable(
        name = "rel_evidence__level_of_evidence",
        joinColumns = @JoinColumn(name = "evidence_id"),
        inverseJoinColumns = @JoinColumn(name = "level_of_evidence_id")
    )
    @JsonIgnoreProperties(value = { "evidences" }, allowSetters = true)
    private Set<LevelOfEvidence> levelOfEvidences = new HashSet<>();

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "ensemblGenes", "evidences", "transcripts", "flags", "synonyms", "alterations" }, allowSetters = true)
    @JoinColumn(name = "entrez_gene_id", referencedColumnName = "entrez_gene_id")
    private Gene gene;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Evidence id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return this.uuid;
    }

    public Evidence uuid(String uuid) {
        this.setUuid(uuid);
        return this;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getEvidenceType() {
        return this.evidenceType;
    }

    public Evidence evidenceType(String evidenceType) {
        this.setEvidenceType(evidenceType);
        return this;
    }

    public void setEvidenceType(String evidenceType) {
        this.evidenceType = evidenceType;
    }

    public String getKnownEffect() {
        return this.knownEffect;
    }

    public Evidence knownEffect(String knownEffect) {
        this.setKnownEffect(knownEffect);
        return this;
    }

    public void setKnownEffect(String knownEffect) {
        this.knownEffect = knownEffect;
    }

    public String getDescription() {
        return this.description;
    }

    public Evidence description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNote() {
        return this.note;
    }

    public Evidence note(String note) {
        this.setNote(note);
        return this;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Association getAssociation() {
        return this.association;
    }

    public void setAssociation(Association association) {
        this.association = association;
    }

    public Evidence association(Association association) {
        this.setAssociation(association);
        return this;
    }

    public Set<LevelOfEvidence> getLevelOfEvidences() {
        return this.levelOfEvidences;
    }

    public void setLevelOfEvidences(Set<LevelOfEvidence> levelOfEvidences) {
        this.levelOfEvidences = levelOfEvidences;
    }

    public Evidence levelOfEvidences(Set<LevelOfEvidence> levelOfEvidences) {
        this.setLevelOfEvidences(levelOfEvidences);
        return this;
    }

    public Evidence addLevelOfEvidence(LevelOfEvidence levelOfEvidence) {
        this.levelOfEvidences.add(levelOfEvidence);
        levelOfEvidence.getEvidences().add(this);
        return this;
    }

    public Evidence removeLevelOfEvidence(LevelOfEvidence levelOfEvidence) {
        this.levelOfEvidences.remove(levelOfEvidence);
        levelOfEvidence.getEvidences().remove(this);
        return this;
    }

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public Evidence gene(Gene gene) {
        this.setGene(gene);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Evidence)) {
            return false;
        }
        return id != null && id.equals(((Evidence) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Evidence{" +
            "id=" + getId() +
            ", uuid='" + getUuid() + "'" +
            ", evidenceType='" + getEvidenceType() + "'" +
            ", knownEffect='" + getKnownEffect() + "'" +
            ", description='" + getDescription() + "'" +
            ", note='" + getNote() + "'" +
            "}";
    }
}
