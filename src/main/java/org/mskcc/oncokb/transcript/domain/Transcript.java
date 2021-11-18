package org.mskcc.oncokb.transcript.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;

/**
 * A Transcript.
 */
@Entity
@Table(name = "transcript")
public class Transcript implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "entrez_gene_id", nullable = false)
    private Integer entrezGeneId;

    @NotNull
    @Column(name = "hugo_symbol", nullable = false)
    private String hugoSymbol;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_genome", nullable = false)
    private ReferenceGenome referenceGenome;

    @Column(name = "ensembl_transcript_id")
    private String ensemblTranscriptId;

    @Column(name = "ensembl_protein_id")
    private String ensemblProteinId;

    @Column(name = "reference_sequence_id")
    private String referenceSequenceId;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "transcript", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<GenomeFragment> fragments = new HashSet<>();

    @OneToMany(mappedBy = "transcript")
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<TranscriptUsage> transcriptUsages = new HashSet<>();

    @OneToMany(mappedBy = "transcript", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<Sequence> sequences = new HashSet<>();

    public Transcript() {}

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Transcript id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getEntrezGeneId() {
        return this.entrezGeneId;
    }

    public Transcript entrezGeneId(Integer entrezGeneId) {
        this.setEntrezGeneId(entrezGeneId);
        return this;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return this.hugoSymbol;
    }

    public Transcript hugoSymbol(String hugoSymbol) {
        this.setHugoSymbol(hugoSymbol);
        return this;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public ReferenceGenome getReferenceGenome() {
        return this.referenceGenome;
    }

    public Transcript referenceGenome(ReferenceGenome referenceGenome) {
        this.setReferenceGenome(referenceGenome);
        return this;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getEnsemblTranscriptId() {
        return this.ensemblTranscriptId;
    }

    public Transcript ensemblTranscriptId(String ensemblTranscriptId) {
        this.setEnsemblTranscriptId(ensemblTranscriptId);
        return this;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public String getEnsemblProteinId() {
        return this.ensemblProteinId;
    }

    public Transcript ensemblProteinId(String ensemblProteinId) {
        this.setEnsemblProteinId(ensemblProteinId);
        return this;
    }

    public void setEnsemblProteinId(String ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
    }

    public String getReferenceSequenceId() {
        return this.referenceSequenceId;
    }

    public Transcript referenceSequenceId(String referenceSequenceId) {
        this.setReferenceSequenceId(referenceSequenceId);
        return this;
    }

    public void setReferenceSequenceId(String referenceSequenceId) {
        this.referenceSequenceId = referenceSequenceId;
    }

    public String getDescription() {
        return this.description;
    }

    public Transcript description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<GenomeFragment> getFragments() {
        return this.fragments;
    }

    public void setFragments(Set<GenomeFragment> genomeFragments) {
        if (this.fragments != null) {
            this.fragments.forEach(i -> i.setTranscript(null));
        }
        if (genomeFragments != null) {
            genomeFragments.forEach(i -> i.setTranscript(this));
        }
        this.fragments = genomeFragments;
    }

    public Transcript fragments(Set<GenomeFragment> genomeFragments) {
        this.setFragments(genomeFragments);
        return this;
    }

    public Transcript addFragments(GenomeFragment genomeFragment) {
        this.fragments.add(genomeFragment);
        genomeFragment.setTranscript(this);
        return this;
    }

    public Transcript removeFragments(GenomeFragment genomeFragment) {
        this.fragments.remove(genomeFragment);
        genomeFragment.setTranscript(null);
        return this;
    }

    public Set<TranscriptUsage> getTranscriptUsages() {
        return this.transcriptUsages;
    }

    public void setTranscriptUsages(Set<TranscriptUsage> transcriptUsages) {
        if (this.transcriptUsages != null) {
            this.transcriptUsages.forEach(i -> i.setTranscript(null));
        }
        if (transcriptUsages != null) {
            transcriptUsages.forEach(i -> i.setTranscript(this));
        }
        this.transcriptUsages = transcriptUsages;
    }

    public Transcript transcriptUsages(Set<TranscriptUsage> transcriptUsages) {
        this.setTranscriptUsages(transcriptUsages);
        return this;
    }

    public Transcript addTranscriptUsage(TranscriptUsage transcriptUsage) {
        this.transcriptUsages.add(transcriptUsage);
        transcriptUsage.setTranscript(this);
        return this;
    }

    public Transcript removeTranscriptUsage(TranscriptUsage transcriptUsage) {
        this.transcriptUsages.remove(transcriptUsage);
        transcriptUsage.setTranscript(null);
        return this;
    }

    public Set<Sequence> getSequences() {
        return this.sequences;
    }

    public void setSequences(Set<Sequence> sequences) {
        if (this.sequences != null) {
            this.sequences.forEach(i -> i.setTranscript(null));
        }
        if (sequences != null) {
            sequences.forEach(i -> i.setTranscript(this));
        }
        this.sequences = sequences;
    }

    public Transcript sequences(Set<Sequence> sequences) {
        this.setSequences(sequences);
        return this;
    }

    public Transcript addSequence(Sequence sequence) {
        this.sequences.add(sequence);
        sequence.setTranscript(this);
        return this;
    }

    public Transcript removeSequence(Sequence sequence) {
        this.sequences.remove(sequence);
        sequence.setTranscript(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Transcript)) {
            return false;
        }
        return id != null && id.equals(((Transcript) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Transcript{" +
            "id=" + getId() +
            ", entrezGeneId=" + getEntrezGeneId() +
            ", hugoSymbol='" + getHugoSymbol() + "'" +
            ", referenceGenome='" + getReferenceGenome() + "'" +
            ", ensemblTranscriptId='" + getEnsemblTranscriptId() + "'" +
            ", ensemblProteinId='" + getEnsemblProteinId() + "'" +
            ", referenceSequenceId='" + getReferenceSequenceId() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
