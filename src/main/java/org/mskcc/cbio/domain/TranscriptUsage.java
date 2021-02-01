package org.mskcc.cbio.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import org.mskcc.cbio.domain.enumeration.UsageSource;

/**
 * A TranscriptUsage.
 */
@Entity
@Table(name = "transcript_usage")
public class TranscriptUsage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private UsageSource source;

    @ManyToOne
    @JsonIgnoreProperties(value = { "transcriptUsages" }, allowSetters = true)
    private Transcript transcript;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TranscriptUsage id(Long id) {
        this.id = id;
        return this;
    }

    public UsageSource getSource() {
        return this.source;
    }

    public TranscriptUsage source(UsageSource source) {
        this.source = source;
        return this;
    }

    public void setSource(UsageSource source) {
        this.source = source;
    }

    public Transcript getTranscript() {
        return this.transcript;
    }

    public TranscriptUsage transcript(Transcript transcript) {
        this.setTranscript(transcript);
        return this;
    }

    public void setTranscript(Transcript transcript) {
        this.transcript = transcript;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TranscriptUsage)) {
            return false;
        }
        return id != null && id.equals(((TranscriptUsage) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TranscriptUsage{" +
            "id=" + getId() +
            ", source='" + getSource() + "'" +
            "}";
    }
}
