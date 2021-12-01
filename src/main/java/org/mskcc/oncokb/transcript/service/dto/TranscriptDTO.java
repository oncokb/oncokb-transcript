package org.mskcc.oncokb.transcript.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import javax.validation.constraints.*;
import org.mskcc.oncokb.transcript.domain.GenomeFragment;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;

/**
 * A DTO for the {@link org.mskcc.oncokb.transcript.domain.Transcript} entity.
 */
public class TranscriptDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer entrezGeneId;

    @NotNull
    private String hugoSymbol;

    @NotNull
    private String referenceGenome;

    private String ensemblTranscriptId;

    private String ensemblProteinId;

    private String referenceSequenceId;

    private String description;

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

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return hugoSymbol;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public String getReferenceGenome() {
        return referenceGenome;
    }

    public void setReferenceGenome(String referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public String getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(String ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
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

    public TranscriptDTO() {}

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
            "id=" + id +
            ", entrezGeneId=" + entrezGeneId +
            ", hugoSymbol='" + hugoSymbol + '\'' +
            ", referenceGenome=" + referenceGenome +
            ", ensemblTranscriptId='" + ensemblTranscriptId + '\'' +
            ", ensemblProteinId='" + ensemblProteinId + '\'' +
            ", referenceSequenceId='" + referenceSequenceId + '\'' +
            ", description='" + description + '\'' +
            ", strand=" + strand +
            ", chromosome='" + chromosome + '\'' +
            ", start=" + start +
            ", end=" + end +
            ", exons=" + exons +
            ", utrs=" + utrs +
            '}';
    }
}
