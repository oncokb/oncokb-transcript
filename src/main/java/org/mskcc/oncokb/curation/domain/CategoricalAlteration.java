package org.mskcc.oncokb.curation.domain;

import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.domain.enumeration.CategoricalAlterationType;

/**
 * A CategoricalAlteration.
 */
@Entity
@Table(name = "categorical_alteration")
public class CategoricalAlteration implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private CategoricalAlterationType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "alteration_type", nullable = false)
    private AlterationType alterationType;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CategoricalAlteration id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public CategoricalAlteration name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CategoricalAlterationType getType() {
        return this.type;
    }

    public CategoricalAlteration type(CategoricalAlterationType type) {
        this.setType(type);
        return this;
    }

    public void setType(CategoricalAlterationType type) {
        this.type = type;
    }

    public AlterationType getAlterationType() {
        return this.alterationType;
    }

    public CategoricalAlteration alterationType(AlterationType alterationType) {
        this.setAlterationType(alterationType);
        return this;
    }

    public void setAlterationType(AlterationType alterationType) {
        this.alterationType = alterationType;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CategoricalAlteration)) {
            return false;
        }
        return id != null && id.equals(((CategoricalAlteration) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CategoricalAlteration{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", type='" + getType() + "'" +
            ", alterationType='" + getAlterationType() + "'" +
            "}";
    }
}
