package org.mskcc.cbio.domain;

import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;

/**
 * A Sequence.
 */
@Entity
@Table(name = "sequence")
public class Sequence implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Lob
    @Column(name = "protein_sequence")
    private String proteinSequence;

    @Column(name = "description")
    private String description;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sequence id(Long id) {
        this.id = id;
        return this;
    }

    public Integer getEntrezGeneId() {
        return this.entrezGeneId;
    }

    public Sequence entrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
        return this;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return this.hugoSymbol;
    }

    public Sequence hugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
        return this;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public ReferenceGenome getReferenceGenome() {
        return this.referenceGenome;
    }

    public Sequence referenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
        return this;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getEnsemblTranscriptId() {
        return this.ensemblTranscriptId;
    }

    public Sequence ensemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
        return this;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public String getEnsemblProteinId() {
        return this.ensemblProteinId;
    }

    public Sequence ensemblProteinId(String ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
        return this;
    }

    public void setEnsemblProteinId(String ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
    }

    public String getReferenceSequenceId() {
        return this.referenceSequenceId;
    }

    public Sequence referenceSequenceId(String referenceSequenceId) {
        this.referenceSequenceId = referenceSequenceId;
        return this;
    }

    public void setReferenceSequenceId(String referenceSequenceId) {
        this.referenceSequenceId = referenceSequenceId;
    }

    public String getProteinSequence() {
        return this.proteinSequence;
    }

    public Sequence proteinSequence(String proteinSequence) {
        this.proteinSequence = proteinSequence;
        return this;
    }

    public void setProteinSequence(String proteinSequence) {
        this.proteinSequence = proteinSequence;
    }

    public String getDescription() {
        return this.description;
    }

    public Sequence description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Sequence)) {
            return false;
        }
        return id != null && id.equals(((Sequence) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Sequence{" +
            "id=" + getId() +
            ", entrezGeneId=" + getEntrezGeneId() +
            ", hugoSymbol='" + getHugoSymbol() + "'" +
            ", referenceGenome='" + getReferenceGenome() + "'" +
            ", ensemblTranscriptId='" + getEnsemblTranscriptId() + "'" +
            ", ensemblProteinId='" + getEnsemblProteinId() + "'" +
            ", referenceSequenceId='" + getReferenceSequenceId() + "'" +
            ", proteinSequence='" + getProteinSequence() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
