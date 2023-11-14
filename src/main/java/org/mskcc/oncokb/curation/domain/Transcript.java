package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_genome")
    private ReferenceGenome referenceGenome;

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

    @ShallowReference
    @OneToMany(mappedBy = "transcript")
    @JsonIgnoreProperties(value = { "transcript" }, allowSetters = true)
    private Set<Sequence> sequences = new HashSet<>();

    @ShallowReference
    @OneToMany(mappedBy = "transcript")
    @JsonIgnoreProperties(value = { "seqRegion", "transcript" }, allowSetters = true)
    private Set<GenomeFragment> fragments = new HashSet<>();

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_transcript__flag",
        joinColumns = @JoinColumn(name = "transcript_id"),
        inverseJoinColumns = @JoinColumn(name = "flag_id")
    )
    @JsonIgnoreProperties(value = { "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "transcripts", "gene", "seqRegion" }, allowSetters = true)
    private EnsemblGene ensemblGene;

    @ManyToOne
    @JsonIgnoreProperties(value = { "ensemblGenes", "transcripts", "flags", "synonyms", "alterations" }, allowSetters = true)
    @JoinColumn(name = "entrez_gene_id", referencedColumnName = "entrez_gene_id")
    private Gene gene;

    @ShallowReference
    @ManyToMany(mappedBy = "transcripts")
    @JsonIgnoreProperties(value = { "genes", "transcripts", "consequence", "associations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

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

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Transcript flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Transcript addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getTranscripts().add(this);
        return this;
    }

    public Transcript removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getTranscripts().remove(this);
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

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public Transcript gene(Gene gene) {
        this.setGene(gene);
        return this;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        if (this.alterations != null) {
            this.alterations.forEach(i -> i.removeTranscript(this));
        }
        if (alterations != null) {
            alterations.forEach(i -> i.addTranscript(this));
        }
        this.alterations = alterations;
    }

    public Transcript alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Transcript addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getTranscripts().add(this);
        return this;
    }

    public Transcript removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getTranscripts().remove(this);
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
            ", referenceGenome='" + getReferenceGenome() + "'" +
            ", ensemblTranscriptId='" + getEnsemblTranscriptId() + "'" +
            ", canonical='" + getCanonical() + "'" +
            ", ensemblProteinId='" + getEnsemblProteinId() + "'" +
            ", referenceSequenceId='" + getReferenceSequenceId() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
