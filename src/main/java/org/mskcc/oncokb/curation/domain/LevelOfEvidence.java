package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A LevelOfEvidence.
 */
@Entity
@Table(name = "level_of_evidence")
public class LevelOfEvidence implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "level", nullable = false)
    private String level;

    @ManyToMany(mappedBy = "levelOfEvidences")
    @JsonIgnoreProperties(value = { "association", "levelOfEvidences" }, allowSetters = true)
    private Set<Evidence> evidences = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LevelOfEvidence id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public LevelOfEvidence type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLevel() {
        return this.level;
    }

    public LevelOfEvidence level(String level) {
        this.setLevel(level);
        return this;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public Set<Evidence> getEvidences() {
        return this.evidences;
    }

    public void setEvidences(Set<Evidence> evidences) {
        if (this.evidences != null) {
            this.evidences.forEach(i -> i.removeLevelOfEvidence(this));
        }
        if (evidences != null) {
            evidences.forEach(i -> i.addLevelOfEvidence(this));
        }
        this.evidences = evidences;
    }

    public LevelOfEvidence evidences(Set<Evidence> evidences) {
        this.setEvidences(evidences);
        return this;
    }

    public LevelOfEvidence addEvidence(Evidence evidence) {
        this.evidences.add(evidence);
        evidence.getLevelOfEvidences().add(this);
        return this;
    }

    public LevelOfEvidence removeEvidence(Evidence evidence) {
        this.evidences.remove(evidence);
        evidence.getLevelOfEvidences().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LevelOfEvidence)) {
            return false;
        }
        return id != null && id.equals(((LevelOfEvidence) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LevelOfEvidence{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", level='" + getLevel() + "'" +
            "}";
    }
}
