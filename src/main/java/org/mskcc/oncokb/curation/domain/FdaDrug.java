package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A FdaDrug.
 */
@Entity
@Table(name = "fda_drug")
public class FdaDrug implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "application_number", nullable = false, unique = true)
    private String applicationNumber;

    @JsonIgnoreProperties(value = { "fdaDrug", "synonyms", "biomarkerAssociations", "brands" }, allowSetters = true)
    @OneToOne(mappedBy = "fdaDrug")
    private Drug drug;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FdaDrug id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return this.applicationNumber;
    }

    public FdaDrug applicationNumber(String applicationNumber) {
        this.setApplicationNumber(applicationNumber);
        return this;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Drug getDrug() {
        return this.drug;
    }

    public void setDrug(Drug drug) {
        if (this.drug != null) {
            this.drug.setFdaDrug(null);
        }
        if (drug != null) {
            drug.setFdaDrug(this);
        }
        this.drug = drug;
    }

    public FdaDrug drug(Drug drug) {
        this.setDrug(drug);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FdaDrug)) {
            return false;
        }
        return id != null && id.equals(((FdaDrug) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaDrug{" +
            "id=" + getId() +
            ", applicationNumber='" + getApplicationNumber() + "'" +
            "}";
    }
}
