package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

@Entity
@Table(name = "allele_state")
public class AlleleState implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "alleleStates")
    @JsonIgnoreProperties(value = { "alleleStates", "associations" }, allowSetters = true)
    private Set<GenomicIndicator> genomicIndicators = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public AlleleState(String name) {
        this.name = name;
    }

    public Long getId() {
        return this.id;
    }

    public AlleleState id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public AlleleState() {}

    public AlleleState name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<GenomicIndicator> getGenomicIndicators() {
        return this.genomicIndicators;
    }

    public void setGenomicIndicators(Set<GenomicIndicator> genomicIndicators) {
        if (this.genomicIndicators != null) {
            this.genomicIndicators.forEach(i -> i.removeAlleleState(this));
        }
        if (genomicIndicators != null) {
            genomicIndicators.forEach(i -> i.addAlleleState(this));
        }
        this.genomicIndicators = genomicIndicators;
    }

    public AlleleState genomicIndicators(Set<GenomicIndicator> genomicIndicators) {
        this.setGenomicIndicators(genomicIndicators);
        return this;
    }

    public AlleleState addGenomicIndicator(GenomicIndicator genomicIndicator) {
        this.genomicIndicators.add(genomicIndicator);
        genomicIndicator.getAlleleStates().add(this);
        return this;
    }

    public AlleleState removeGenomicIndicator(GenomicIndicator genomicIndicator) {
        this.genomicIndicators.remove(genomicIndicator);
        genomicIndicator.getAlleleStates().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AlleleState)) {
            return false;
        }
        return id != null && id.equals(((AlleleState) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AlleleState{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
