package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.DiffIgnore;

/**
 * A SeqRegion.
 */
@Entity
@Table(name = "seq_region")
public class SeqRegion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "chromosome")
    private String chromosome;

    @Lob
    @Column(name = "description")
    private String description;

    @DiffIgnore
    @OneToMany(mappedBy = "seqRegion")
    @JsonIgnoreProperties(value = { "transcripts", "gene", "seqRegion" }, allowSetters = true)
    private Set<EnsemblGene> ensemblGenes = new HashSet<>();

    @DiffIgnore
    @OneToMany(mappedBy = "seqRegion")
    @JsonIgnoreProperties(value = { "seqRegion", "transcript" }, allowSetters = true)
    private Set<GenomeFragment> genomeFragments = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SeqRegion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public SeqRegion name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getChromosome() {
        return this.chromosome;
    }

    public SeqRegion chromosome(String chromosome) {
        this.setChromosome(chromosome);
        return this;
    }

    public void setChromosome(String chromosome) {
        this.chromosome = chromosome;
    }

    public String getDescription() {
        return this.description;
    }

    public SeqRegion description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<EnsemblGene> getEnsemblGenes() {
        return this.ensemblGenes;
    }

    public void setEnsemblGenes(Set<EnsemblGene> ensemblGenes) {
        if (this.ensemblGenes != null) {
            this.ensemblGenes.forEach(i -> i.setSeqRegion(null));
        }
        if (ensemblGenes != null) {
            ensemblGenes.forEach(i -> i.setSeqRegion(this));
        }
        this.ensemblGenes = ensemblGenes;
    }

    public SeqRegion ensemblGenes(Set<EnsemblGene> ensemblGenes) {
        this.setEnsemblGenes(ensemblGenes);
        return this;
    }

    public SeqRegion addEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.add(ensemblGene);
        ensemblGene.setSeqRegion(this);
        return this;
    }

    public SeqRegion removeEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.remove(ensemblGene);
        ensemblGene.setSeqRegion(null);
        return this;
    }

    public Set<GenomeFragment> getGenomeFragments() {
        return this.genomeFragments;
    }

    public void setGenomeFragments(Set<GenomeFragment> genomeFragments) {
        if (this.genomeFragments != null) {
            this.genomeFragments.forEach(i -> i.setSeqRegion(null));
        }
        if (genomeFragments != null) {
            genomeFragments.forEach(i -> i.setSeqRegion(this));
        }
        this.genomeFragments = genomeFragments;
    }

    public SeqRegion genomeFragments(Set<GenomeFragment> genomeFragments) {
        this.setGenomeFragments(genomeFragments);
        return this;
    }

    public SeqRegion addGenomeFragment(GenomeFragment genomeFragment) {
        this.genomeFragments.add(genomeFragment);
        genomeFragment.setSeqRegion(this);
        return this;
    }

    public SeqRegion removeGenomeFragment(GenomeFragment genomeFragment) {
        this.genomeFragments.remove(genomeFragment);
        genomeFragment.setSeqRegion(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SeqRegion)) {
            return false;
        }
        return id != null && id.equals(((SeqRegion) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SeqRegion{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", chromosome='" + getChromosome() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
