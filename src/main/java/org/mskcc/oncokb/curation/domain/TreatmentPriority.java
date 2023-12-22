package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A TreatmentPriority.
 */
@Entity
@Table(name = "treatment_priority")
public class TreatmentPriority implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "priority", nullable = false)
    private Integer priority;

    @ShallowReference
    @ManyToOne
    @JsonIgnoreProperties(value = { "treatmentPriorities", "drugs", "associations" }, allowSetters = true)
    private Treatment treatment;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TreatmentPriority id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getPriority() {
        return this.priority;
    }

    public TreatmentPriority priority(Integer priority) {
        this.setPriority(priority);
        return this;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Treatment getTreatment() {
        return this.treatment;
    }

    public void setTreatment(Treatment treatment) {
        this.treatment = treatment;
    }

    public TreatmentPriority treatment(Treatment treatment) {
        this.setTreatment(treatment);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TreatmentPriority)) {
            return false;
        }
        return id != null && id.equals(((TreatmentPriority) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TreatmentPriority{" +
            "id=" + getId() +
            ", priority=" + getPriority() +
            "}";
    }
}
