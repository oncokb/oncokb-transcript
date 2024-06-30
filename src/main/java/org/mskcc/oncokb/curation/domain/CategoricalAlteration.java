package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;

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
    @Enumerated(EnumType.STRING)
    @Column(name = "alteration_type", nullable = false)
    private AlterationType alterationType;

    @NotNull
    @Column(name = "type", nullable = false, unique = true)
    private String type;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    @JsonIgnoreProperties(value = { "alterations", "categoricalAlterations" }, allowSetters = true)
    @JoinColumn(name = "consequence", referencedColumnName = "term")
    private Consequence consequence;

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

    public String getType() {
        return this.type;
    }

    public CategoricalAlteration type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
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

    public Consequence getConsequence() {
        return this.consequence;
    }

    public void setConsequence(Consequence consequence) {
        this.consequence = consequence;
    }

    public CategoricalAlteration consequence(Consequence consequence) {
        this.setConsequence(consequence);
        return this;
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
            ", alterationType='" + getAlterationType() + "'" +
            ", type='" + getType() + "'" +
            ", name='" + getName() + "'" +
            "}";
    }
}
