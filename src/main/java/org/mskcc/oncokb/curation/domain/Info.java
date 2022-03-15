package org.mskcc.oncokb.curation.domain;

import java.io.Serializable;
import java.time.Instant;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;

/**
 * A Info.
 */
@Entity
@Table(name = "info")
public class Info implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, unique = true)
    private InfoType type;

    @Column(name = "value")
    private String value;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Info id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InfoType getType() {
        return this.type;
    }

    public Info type(InfoType type) {
        this.setType(type);
        return this;
    }

    public void setType(InfoType type) {
        this.type = type;
    }

    public String getValue() {
        return this.value;
    }

    public Info value(String value) {
        this.setValue(value);
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Instant getLastUpdated() {
        return this.lastUpdated;
    }

    public Info lastUpdated(Instant lastUpdated) {
        this.setLastUpdated(lastUpdated);
        return this;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Info)) {
            return false;
        }
        return id != null && id.equals(((Info) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Info{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", value='" + getValue() + "'" +
            ", lastUpdated='" + getLastUpdated() + "'" +
            "}";
    }
}
