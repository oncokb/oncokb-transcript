package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
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

    @Column(name = "chromosome")
    private String chromosome;

    @Column(name = "start")
    private Integer start;

    @Column(name = "end")
    private Integer end;

    @Column(name = "strand")
    private Integer strand;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private GenomeFragmentType type;

    @ManyToOne
    @JsonIgnoreProperties(value = { "fragments", "sequences", "ensemblGene" }, allowSetters = true)
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

    public String getChromosome() {
        return this.chromosome;
    }

    public GenomeFragment chromosome(String chromosome) {
        this.setChromosome(chromosome);
        return this;
    }

    public void setChromosome(String chromosome) {
        this.chromosome = chromosome;
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
            ", chromosome='" + getChromosome() + "'" +
            ", start=" + getStart() +
            ", end=" + getEnd() +
            ", strand=" + getStrand() +
            ", type='" + getType() + "'" +
            "}";
    }
}
