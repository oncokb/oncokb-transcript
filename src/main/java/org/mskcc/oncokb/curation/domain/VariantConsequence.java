package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A VariantConsequence.
 */
@Entity
@Table(name = "variant_consequence")
public class VariantConsequence implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "term", nullable = false)
    private String term;

    @NotNull
    @Column(name = "is_generally_truncating", nullable = false)
    private Boolean isGenerallyTruncating;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "consequence")
    @JsonIgnoreProperties(value = { "deviceUsageIndications", "consequence", "genes" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public VariantConsequence id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTerm() {
        return this.term;
    }

    public VariantConsequence term(String term) {
        this.setTerm(term);
        return this;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public Boolean getIsGenerallyTruncating() {
        return this.isGenerallyTruncating;
    }

    public VariantConsequence isGenerallyTruncating(Boolean isGenerallyTruncating) {
        this.setIsGenerallyTruncating(isGenerallyTruncating);
        return this;
    }

    public void setIsGenerallyTruncating(Boolean isGenerallyTruncating) {
        this.isGenerallyTruncating = isGenerallyTruncating;
    }

    public String getDescription() {
        return this.description;
    }

    public VariantConsequence description(String description) {
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

    public VariantConsequence alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public VariantConsequence addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.setConsequence(this);
        return this;
    }

    public VariantConsequence removeAlteration(Alteration alteration) {
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
        if (!(o instanceof VariantConsequence)) {
            return false;
        }
        return id != null && id.equals(((VariantConsequence) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VariantConsequence{" +
            "id=" + getId() +
            ", term='" + getTerm() + "'" +
            ", isGenerallyTruncating='" + getIsGenerallyTruncating() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
