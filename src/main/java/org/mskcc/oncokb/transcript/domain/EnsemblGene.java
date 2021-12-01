package org.mskcc.oncokb.transcript.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A EnsemblGene.
 */
@Entity
@Table(name = "ensembl_gene")
public class EnsemblGene implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "reference_genome", nullable = false)
    private String referenceGenome;

    @NotNull
    @Column(name = "ensembl_gene_id", nullable = false)
    private String ensemblGeneId;

    @NotNull
    @Column(name = "canonical", nullable = false)
    private Boolean canonical = false;

    @NotNull
    @Column(name = "chromosome", nullable = false)
    private String chromosome;

    @NotNull
    @Column(name = "start", nullable = false)
    private Integer start;

    @NotNull
    @Column(name = "end", nullable = false)
    private Integer end;

    @NotNull
    @Column(name = "strand", nullable = false)
    private Integer strand;

    @ManyToOne
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes" }, allowSetters = true)
    private Gene gene;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public EnsemblGene id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceGenome() {
        return this.referenceGenome;
    }

    public EnsemblGene referenceGenome(String referenceGenome) {
        this.setReferenceGenome(referenceGenome);
        return this;
    }

    public void setReferenceGenome(String referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getEnsemblGeneId() {
        return this.ensemblGeneId;
    }

    public EnsemblGene ensemblGeneId(String ensemblGeneId) {
        this.setEnsemblGeneId(ensemblGeneId);
        return this;
    }

    public void setEnsemblGeneId(String ensemblGeneId) {
        this.ensemblGeneId = ensemblGeneId;
    }

    public Boolean getCanonical() {
        return this.canonical;
    }

    public EnsemblGene canonical(Boolean canonical) {
        this.setCanonical(canonical);
        return this;
    }

    public void setCanonical(Boolean canonical) {
        this.canonical = canonical;
    }

    public String getChromosome() {
        return this.chromosome;
    }

    public EnsemblGene chromosome(String chromosome) {
        this.setChromosome(chromosome);
        return this;
    }

    public void setChromosome(String chromosome) {
        this.chromosome = chromosome;
    }

    public Integer getStart() {
        return this.start;
    }

    public EnsemblGene start(Integer start) {
        this.setStart(start);
        return this;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return this.end;
    }

    public EnsemblGene end(Integer end) {
        this.setEnd(end);
        return this;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }

    public Integer getStrand() {
        return this.strand;
    }

    public EnsemblGene strand(Integer strand) {
        this.setStrand(strand);
        return this;
    }

    public void setStrand(Integer strand) {
        this.strand = strand;
    }

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public EnsemblGene gene(Gene gene) {
        this.setGene(gene);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EnsemblGene)) {
            return false;
        }
        return id != null && id.equals(((EnsemblGene) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EnsemblGene{" +
            "id=" + getId() +
            ", referenceGenome='" + getReferenceGenome() + "'" +
            ", ensemblGeneId='" + getEnsemblGeneId() + "'" +
            ", canonical='" + getCanonical() + "'" +
            ", chromosome='" + getChromosome() + "'" +
            ", start=" + getStart() +
            ", end=" + getEnd() +
            ", strand=" + getStrand() +
            "}";
    }
}
