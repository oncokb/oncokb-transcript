package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A Rule.
 */
@Entity
@Table(name = "rule")
public class Rule implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "entity", nullable = false)
    private String entity;

    @Column(name = "rule")
    private String rule;

    @Column(name = "name")
    private String name;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(
        value = {
            "rules",
            "alterations",
            "articles",
            "cancerTypes",
            "drugs",
            "evidence",
            "clinicalTrials",
            "clinicalTrialArms",
            "eligibilityCriteria",
            "fdaSubmissions",
            "genomicIndicators",
        },
        allowSetters = true
    )
    private Association association;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Rule id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEntity() {
        return this.entity;
    }

    public Rule entity(String entity) {
        this.setEntity(entity);
        return this;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public String getRule() {
        return this.rule;
    }

    public Rule rule(String rule) {
        this.setRule(rule);
        return this;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }

    public String getName() {
        return this.name;
    }

    public Rule name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Association getAssociation() {
        return this.association;
    }

    public void setAssociation(Association association) {
        this.association = association;
    }

    public Rule association(Association association) {
        this.setAssociation(association);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Rule)) {
            return false;
        }
        return id != null && id.equals(((Rule) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Rule{" +
            "id=" + getId() +
            ", entity='" + getEntity() + "'" +
            ", rule='" + getRule() + "'" +
            ", name='" + getName() + "'" +
            "}";
    }
}
