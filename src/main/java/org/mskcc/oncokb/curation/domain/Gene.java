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
 * A Gene.
 */
@Entity
@Table(name = "gene")
public class Gene implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "entrez_gene_id", nullable = false, unique = true)
    private Integer entrezGeneId;

    @NotNull
    @Column(name = "hugo_symbol", nullable = false)
    private String hugoSymbol;

    @Column(name = "hgnc_id")
    private String hgncId;

    @DiffIgnore
    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "transcripts", "gene", "seqRegion" }, allowSetters = true)
    private Set<EnsemblGene> ensemblGenes = new HashSet<>();

    @DiffIgnore
    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "association", "levelOfEvidences", "gene" }, allowSetters = true)
    private Set<Evidence> evidences = new HashSet<>();

    @DiffIgnore
    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "sequences", "fragments", "flags", "ensemblGene", "gene", "alterations" }, allowSetters = true)
    private Set<Transcript> transcripts = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(name = "rel_gene__flag", joinColumns = @JoinColumn(name = "gene_id"), inverseJoinColumns = @JoinColumn(name = "flag_id"))
    @JsonIgnoreProperties(value = { "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @DiffIgnore
    @ManyToMany
    @JoinTable(
        name = "rel_gene__synonym",
        joinColumns = @JoinColumn(name = "gene_id"),
        inverseJoinColumns = @JoinColumn(name = "synonym_id")
    )
    @JsonIgnoreProperties(value = { "cancerTypes", "genes", "nciThesauruses" }, allowSetters = true)
    private Set<Synonym> synonyms = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "genes")
    @JsonIgnoreProperties(value = { "genes", "transcripts", "consequence", "associations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Gene id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getEntrezGeneId() {
        return this.entrezGeneId;
    }

    public Gene entrezGeneId(Integer entrezGeneId) {
        this.setEntrezGeneId(entrezGeneId);
        return this;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return this.hugoSymbol;
    }

    public Gene hugoSymbol(String hugoSymbol) {
        this.setHugoSymbol(hugoSymbol);
        return this;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public String getHgncId() {
        return this.hgncId;
    }

    public Gene hgncId(String hgncId) {
        this.setHgncId(hgncId);
        return this;
    }

    public void setHgncId(String hgncId) {
        this.hgncId = hgncId;
    }

    public Set<EnsemblGene> getEnsemblGenes() {
        return this.ensemblGenes;
    }

    public void setEnsemblGenes(Set<EnsemblGene> ensemblGenes) {
        if (this.ensemblGenes != null) {
            this.ensemblGenes.forEach(i -> i.setGene(null));
        }
        if (ensemblGenes != null) {
            ensemblGenes.forEach(i -> i.setGene(this));
        }
        this.ensemblGenes = ensemblGenes;
    }

    public Gene ensemblGenes(Set<EnsemblGene> ensemblGenes) {
        this.setEnsemblGenes(ensemblGenes);
        return this;
    }

    public Gene addEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.add(ensemblGene);
        ensemblGene.setGene(this);
        return this;
    }

    public Gene removeEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.remove(ensemblGene);
        ensemblGene.setGene(null);
        return this;
    }

    public Set<Evidence> getEvidences() {
        return this.evidences;
    }

    public void setEvidences(Set<Evidence> evidences) {
        if (this.evidences != null) {
            this.evidences.forEach(i -> i.setGene(null));
        }
        if (evidences != null) {
            evidences.forEach(i -> i.setGene(this));
        }
        this.evidences = evidences;
    }

    public Gene evidences(Set<Evidence> evidences) {
        this.setEvidences(evidences);
        return this;
    }

    public Gene addEvidence(Evidence evidence) {
        this.evidences.add(evidence);
        evidence.setGene(this);
        return this;
    }

    public Gene removeEvidence(Evidence evidence) {
        this.evidences.remove(evidence);
        evidence.setGene(null);
        return this;
    }

    public Set<Transcript> getTranscripts() {
        return this.transcripts;
    }

    public void setTranscripts(Set<Transcript> transcripts) {
        if (this.transcripts != null) {
            this.transcripts.forEach(i -> i.setGene(null));
        }
        if (transcripts != null) {
            transcripts.forEach(i -> i.setGene(this));
        }
        this.transcripts = transcripts;
    }

    public Gene transcripts(Set<Transcript> transcripts) {
        this.setTranscripts(transcripts);
        return this;
    }

    public Gene addTranscript(Transcript transcript) {
        this.transcripts.add(transcript);
        transcript.setGene(this);
        return this;
    }

    public Gene removeTranscript(Transcript transcript) {
        this.transcripts.remove(transcript);
        transcript.setGene(null);
        return this;
    }

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Gene flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Gene addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getGenes().add(this);
        return this;
    }

    public Gene removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getGenes().remove(this);
        return this;
    }

    public Set<Synonym> getSynonyms() {
        return this.synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    public Gene synonyms(Set<Synonym> synonyms) {
        this.setSynonyms(synonyms);
        return this;
    }

    public Gene addSynonym(Synonym synonym) {
        this.synonyms.add(synonym);
        synonym.getGenes().add(this);
        return this;
    }

    public Gene removeSynonym(Synonym synonym) {
        this.synonyms.remove(synonym);
        synonym.getGenes().remove(this);
        return this;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        if (this.alterations != null) {
            this.alterations.forEach(i -> i.removeGene(this));
        }
        if (alterations != null) {
            alterations.forEach(i -> i.addGene(this));
        }
        this.alterations = alterations;
    }

    public Gene alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Gene addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getGenes().add(this);
        return this;
    }

    public Gene removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getGenes().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Gene)) {
            return false;
        }
        return id != null && id.equals(((Gene) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Gene{" +
            "id=" + getId() +
            ", entrezGeneId=" + getEntrezGeneId() +
            ", hugoSymbol='" + getHugoSymbol() + "'" +
            ", hgncId='" + getHgncId() + "'" +
            "}";
    }
}
