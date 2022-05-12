package org.mskcc.oncokb.curation.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.GenomeFragment;

/**
 * A DTO for the {@link org.mskcc.oncokb.curation.domain.Transcript} entity.
 */
public class TranscriptDTO implements Serializable {

    private Long id;

    private String ensemblTranscriptId;

    @NotNull
    private Boolean canonical = false;

    private String ensemblProteinId;

    private String referenceSequenceId;

    private String description;

    private EnsemblGene ensemblGene;

    private Integer strand;

    private String chromosome;

    private Integer start;

    private Integer end;

    private List<GenomeFragment> exons = new ArrayList<>();

    private List<GenomeFragment> utrs = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
    }

    public Boolean getCanonical() {
        return canonical;
    }

    public void setCanonical(Boolean canonical) {
        this.canonical = canonical;
    }

    public String getEnsemblProteinId() {
        return ensemblProteinId;
    }

    public void setEnsemblProteinId(String ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
    }

    public String getReferenceSequenceId() {
        return referenceSequenceId;
    }

    public void setReferenceSequenceId(String referenceSequenceId) {
        this.referenceSequenceId = referenceSequenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStrand() {
        return strand;
    }

    public void setStrand(Integer strand) {
        this.strand = strand;
    }

    public String getChromosome() {
        return chromosome;
    }

    public void setChromosome(String chromosome) {
        this.chromosome = chromosome;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return end;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }

    public List<GenomeFragment> getExons() {
        return exons;
    }

    public void setExons(List<GenomeFragment> exons) {
        this.exons = exons;
    }

    public List<GenomeFragment> getUtrs() {
        return utrs;
    }

    public void setUtrs(List<GenomeFragment> utrs) {
        this.utrs = utrs;
    }

    public EnsemblGene getEnsemblGene() {
        return ensemblGene;
    }

    public void setEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGene = ensemblGene;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TranscriptDTO)) {
            return false;
        }

        TranscriptDTO transcriptDTO = (TranscriptDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, transcriptDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TranscriptDTO{" +
            "id=" + getId() +
            ", ensemblTranscriptId='" + getEnsemblTranscriptId() + "'" +
            ", canonical='" + getCanonical() + "'" +
            ", ensemblProteinId='" + getEnsemblProteinId() + "'" +
            ", referenceSequenceId='" + getReferenceSequenceId() + "'" +
            ", description='" + getDescription() + "'" +
            ", ensemblGene=" + getEnsemblGene() +
            "}";
    }
}
