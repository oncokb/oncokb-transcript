package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;

/**
 * A Consequence.
 */
@Entity
@Table(name = "consequence")
public class Consequence implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AlterationType type;

    @NotNull
    @Column(name = "term", nullable = false)
    private String term;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "is_generally_truncating", nullable = false)
    private Boolean isGenerallyTruncating;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "consequence")
    @JsonIgnoreProperties(value = { "biomarkerAssociations", "genes", "referenceGenomes", "consequence" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Consequence id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AlterationType getType() {
        return this.type;
    }

    public Consequence type(AlterationType type) {
        this.setType(type);
        return this;
    }

    public void setType(AlterationType type) {
        this.type = type;
    }

    public String getTerm() {
        return this.term;
    }

    public Consequence term(String term) {
        this.setTerm(term);
        return this;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getName() {
        return this.name;
    }

    public Consequence name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsGenerallyTruncating() {
        return this.isGenerallyTruncating;
    }

    public Consequence isGenerallyTruncating(Boolean isGenerallyTruncating) {
        this.setIsGenerallyTruncating(isGenerallyTruncating);
        return this;
    }

    public void setIsGenerallyTruncating(Boolean isGenerallyTruncating) {
        this.isGenerallyTruncating = isGenerallyTruncating;
    }

    public String getDescription() {
        return this.description;
    }

    public Consequence description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        if (this.alterations != null) {
            this.alterations.forEach(i -> i.setConsequence(null));
        }
        if (alterations != null) {
            alterations.forEach(i -> i.setConsequence(this));
        }
        this.alterations = alterations;
    }

    public Consequence alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Consequence addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.setConsequence(this);
        return this;
    }

    public Consequence removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.setConsequence(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Consequence)) {
            return false;
        }
        return id != null && id.equals(((Consequence) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Consequence{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", term='" + getTerm() + "'" +
            ", name='" + getName() + "'" +
            ", isGenerallyTruncating='" + getIsGenerallyTruncating() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
