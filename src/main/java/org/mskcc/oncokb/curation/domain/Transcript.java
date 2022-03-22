package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

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

    @Column(name = "ensembl_transcript_id")
    private String ensemblTranscriptId;

    @NotNull
    @Column(name = "canonical", nullable = false)
    private Boolean canonical;

    @Column(name = "ensembl_protein_id")
    private String ensemblProteinId;

    @Column(name = "reference_sequence_id")
    private String referenceSequenceId;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "transcript")
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<GenomeFragment> fragments = new HashSet<>();

    @OneToMany(mappedBy = "transcript")
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<Sequence> sequences = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "transcripts", "gene" }, allowSetters = true)
    private EnsemblGene ensemblGene;

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

    public Boolean getCanonical() {
        return this.canonical;
    }

    public Transcript canonical(Boolean canonical) {
        this.setCanonical(canonical);
        return this;
    }

    public void setCanonical(Boolean canonical) {
        this.canonical = canonical;
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

    public EnsemblGene getEnsemblGene() {
        return this.ensemblGene;
    }

    public void setEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGene = ensemblGene;
    }

    public Transcript ensemblGene(EnsemblGene ensemblGene) {
        this.setEnsemblGene(ensemblGene);
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
            ", ensemblTranscriptId='" + getEnsemblTranscriptId() + "'" +
            ", canonical='" + getCanonical() + "'" +
            ", ensemblProteinId='" + getEnsemblProteinId() + "'" +
            ", referenceSequenceId='" + getReferenceSequenceId() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
