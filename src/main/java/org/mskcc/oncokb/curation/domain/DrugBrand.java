package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import org.mskcc.oncokb.curation.domain.enumeration.GeographicRegion;

/**
 * A DrugBrand.
 */
@Entity
@Table(name = "drug_brand")
public class DrugBrand implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "region")
    private GeographicRegion region;

    @ManyToOne
    @JsonIgnoreProperties(value = { "fdaDrug", "synonyms", "deviceUsageIndications", "brands" }, allowSetters = true)
    private Drug drug;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DrugBrand id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public DrugBrand name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GeographicRegion getRegion() {
        return this.region;
    }

    public DrugBrand region(GeographicRegion region) {
        this.setRegion(region);
        return this;
    }

    public void setRegion(GeographicRegion region) {
        this.region = region;
    }

    public Drug getDrug() {
        return this.drug;
    }

    public void setDrug(Drug drug) {
        this.drug = drug;
    }

    public DrugBrand drug(Drug drug) {
        this.setDrug(drug);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DrugBrand)) {
            return false;
        }
        return id != null && id.equals(((DrugBrand) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DrugBrand{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", region='" + getRegion() + "'" +
            "}";
    }
}
