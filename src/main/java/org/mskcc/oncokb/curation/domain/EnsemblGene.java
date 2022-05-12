package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_genome")
    private ReferenceGenome referenceGenome;

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

    @OneToMany(mappedBy = "ensemblGene")
    @JsonIgnoreProperties(value = { "fragments", "sequences", "ensemblGene" }, allowSetters = true)
    private Set<Transcript> transcripts = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes", "alterations" }, allowSetters = true)
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

    public ReferenceGenome getReferenceGenome() {
        return this.referenceGenome;
    }

    public EnsemblGene referenceGenome(ReferenceGenome referenceGenome) {
        this.setReferenceGenome(referenceGenome);
        return this;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
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

    public Set<Transcript> getTranscripts() {
        return this.transcripts;
    }

    public void setTranscripts(Set<Transcript> transcripts) {
        if (this.transcripts != null) {
            this.transcripts.forEach(i -> i.setEnsemblGene(null));
        }
        if (transcripts != null) {
            transcripts.forEach(i -> i.setEnsemblGene(this));
        }
        this.transcripts = transcripts;
    }

    public EnsemblGene transcripts(Set<Transcript> transcripts) {
        this.setTranscripts(transcripts);
        return this;
    }

    public EnsemblGene addTranscript(Transcript transcript) {
        this.transcripts.add(transcript);
        transcript.setEnsemblGene(this);
        return this;
    }

    public EnsemblGene removeTranscript(Transcript transcript) {
        this.transcripts.remove(transcript);
        transcript.setEnsemblGene(null);
        return this;
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
