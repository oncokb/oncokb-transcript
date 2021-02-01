package org.mskcc.cbio.domain;

import java.io.Serializable;
import javax.persistence.*;
import org.mskcc.cbio.domain.enumeration.SequenceType;

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

    @Column(name = "transcript_id")
    private String transcriptId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sequence_type")
    private SequenceType sequenceType;

    @Lob
    @Column(name = "sequene")
    private String sequene;

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

    public String getTranscriptId() {
        return this.transcriptId;
    }

    public Sequence transcriptId(String transcriptId) {
        this.transcriptId = transcriptId;
        return this;
    }

    public void setTranscriptId(String transcriptId) {
        this.transcriptId = transcriptId;
    }

    public SequenceType getSequenceType() {
        return this.sequenceType;
    }

    public Sequence sequenceType(SequenceType sequenceType) {
        this.sequenceType = sequenceType;
        return this;
    }

    public void setSequenceType(SequenceType sequenceType) {
        this.sequenceType = sequenceType;
    }

    public String getSequene() {
        return this.sequene;
    }

    public Sequence sequene(String sequene) {
        this.sequene = sequene;
        return this;
    }

    public void setSequene(String sequene) {
        this.sequene = sequene;
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
            ", transcriptId='" + getTranscriptId() + "'" +
            ", sequenceType='" + getSequenceType() + "'" +
            ", sequene='" + getSequene() + "'" +
            "}";
    }
}
