package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;

/**
 * A GenomeFragment.
 */
@Entity
@Table(name = "genome_fragment")
public class GenomeFragment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "start", nullable = false)
    private Integer start;

    @NotNull
    @Column(name = "end", nullable = false)
    private Integer end;

    @NotNull
    @Column(name = "strand", nullable = false)
    private Integer strand;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private GenomeFragmentType type;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "ensemblGenes", "genomeFragments" }, allowSetters = true)
    @JoinColumn(name = "seq_region", referencedColumnName = "name")
    private SeqRegion seqRegion;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "sequences", "fragments", "flags", "ensemblGene", "gene", "alterations" }, allowSetters = true)
    private Transcript transcript;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public GenomeFragment id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStart() {
        return this.start;
    }

    public GenomeFragment start(Integer start) {
        this.setStart(start);
        return this;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return this.end;
    }

    public GenomeFragment end(Integer end) {
        this.setEnd(end);
        return this;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }

    public Integer getStrand() {
        return this.strand;
    }

    public GenomeFragment strand(Integer strand) {
        this.setStrand(strand);
        return this;
    }

    public void setStrand(Integer strand) {
        this.strand = strand;
    }

    public GenomeFragmentType getType() {
        return this.type;
    }

    public GenomeFragment type(GenomeFragmentType type) {
        this.setType(type);
        return this;
    }

    public void setType(GenomeFragmentType type) {
        this.type = type;
    }

    public SeqRegion getSeqRegion() {
        return this.seqRegion;
    }

    public void setSeqRegion(SeqRegion seqRegion) {
        this.seqRegion = seqRegion;
    }

    public GenomeFragment seqRegion(SeqRegion seqRegion) {
        this.setSeqRegion(seqRegion);
        return this;
    }

    public Transcript getTranscript() {
        return this.transcript;
    }

    public void setTranscript(Transcript transcript) {
        this.transcript = transcript;
    }

    public GenomeFragment transcript(Transcript transcript) {
        this.setTranscript(transcript);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GenomeFragment)) {
            return false;
        }
        return id != null && id.equals(((GenomeFragment) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GenomeFragment{" +
            "id=" + getId() +
            ", start=" + getStart() +
            ", end=" + getEnd() +
            ", strand=" + getStrand() +
            ", type='" + getType() + "'" +
            "}";
    }
}
