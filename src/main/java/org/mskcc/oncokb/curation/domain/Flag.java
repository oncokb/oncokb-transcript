package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A Flag.
 */
@Entity
@Table(name = "flag")
public class Flag implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "flag", nullable = false)
    private String flag;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description", nullable = false)
    private String description;

    @DiffIgnore
    @ManyToMany(mappedBy = "flags")
    @JsonIgnoreProperties(value = { "flags", "genes", "transcripts", "consequence", "associations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "flags")
    @JsonIgnoreProperties(value = { "flags", "associations" }, allowSetters = true)
    private Set<Article> articles = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "flags")
    @JsonIgnoreProperties(value = { "nciThesaurus", "fdaDrug", "flags", "associations" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "flags")
    @JsonIgnoreProperties(value = { "ensemblGenes", "evidences", "transcripts", "flags", "synonyms", "alterations" }, allowSetters = true)
    private Set<Gene> genes = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "flags")
    @JsonIgnoreProperties(value = { "sequences", "fragments", "flags", "ensemblGene", "gene", "alterations" }, allowSetters = true)
    private Set<Transcript> transcripts = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Flag id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public Flag type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFlag() {
        return this.flag;
    }

    public Flag flag(String flag) {
        this.setFlag(flag);
        return this;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public String getName() {
        return this.name;
    }

    public Flag name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Flag description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        if (this.alterations != null) {
            this.alterations.forEach(i -> i.removeFlag(this));
        }
        if (alterations != null) {
            alterations.forEach(i -> i.addFlag(this));
        }
        this.alterations = alterations;
    }

    public Flag alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Flag addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getFlags().add(this);
        return this;
    }

    public Flag removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getFlags().remove(this);
        return this;
    }

    public Set<Article> getArticles() {
        return this.articles;
    }

    public void setArticles(Set<Article> articles) {
        if (this.articles != null) {
            this.articles.forEach(i -> i.removeFlag(this));
        }
        if (articles != null) {
            articles.forEach(i -> i.addFlag(this));
        }
        this.articles = articles;
    }

    public Flag articles(Set<Article> articles) {
        this.setArticles(articles);
        return this;
    }

    public Flag addArticle(Article article) {
        this.articles.add(article);
        article.getFlags().add(this);
        return this;
    }

    public Flag removeArticle(Article article) {
        this.articles.remove(article);
        article.getFlags().remove(this);
        return this;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        if (this.drugs != null) {
            this.drugs.forEach(i -> i.removeFlag(this));
        }
        if (drugs != null) {
            drugs.forEach(i -> i.addFlag(this));
        }
        this.drugs = drugs;
    }

    public Flag drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public Flag addDrug(Drug drug) {
        this.drugs.add(drug);
        drug.getFlags().add(this);
        return this;
    }

    public Flag removeDrug(Drug drug) {
        this.drugs.remove(drug);
        drug.getFlags().remove(this);
        return this;
    }

    public Set<Gene> getGenes() {
        return this.genes;
    }

    public void setGenes(Set<Gene> genes) {
        if (this.genes != null) {
            this.genes.forEach(i -> i.removeFlag(this));
        }
        if (genes != null) {
            genes.forEach(i -> i.addFlag(this));
        }
        this.genes = genes;
    }

    public Flag genes(Set<Gene> genes) {
        this.setGenes(genes);
        return this;
    }

    public Flag addGene(Gene gene) {
        this.genes.add(gene);
        gene.getFlags().add(this);
        return this;
    }

    public Flag removeGene(Gene gene) {
        this.genes.remove(gene);
        gene.getFlags().remove(this);
        return this;
    }

    public Set<Transcript> getTranscripts() {
        return this.transcripts;
    }

    public void setTranscripts(Set<Transcript> transcripts) {
        if (this.transcripts != null) {
            this.transcripts.forEach(i -> i.removeFlag(this));
        }
        if (transcripts != null) {
            transcripts.forEach(i -> i.addFlag(this));
        }
        this.transcripts = transcripts;
    }

    public Flag transcripts(Set<Transcript> transcripts) {
        this.setTranscripts(transcripts);
        return this;
    }

    public Flag addTranscript(Transcript transcript) {
        this.transcripts.add(transcript);
        transcript.getFlags().add(this);
        return this;
    }

    public Flag removeTranscript(Transcript transcript) {
        this.transcripts.remove(transcript);
        transcript.getFlags().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Flag)) {
            return false;
        }
        return id != null && id.equals(((Flag) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Flag{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", flag='" + getFlag() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
