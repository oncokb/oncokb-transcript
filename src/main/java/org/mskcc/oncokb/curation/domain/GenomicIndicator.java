package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A GenomicIndicator.
 */
@Entity
@Table(name = "genomic_indicator")
public class GenomicIndicator implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_genomic_indicator__allele_state",
        joinColumns = @JoinColumn(name = "genomic_indicator_id"),
        inverseJoinColumns = @JoinColumn(name = "allele_state_id")
    )
    @JsonIgnoreProperties(value = { "genomicIndicators" }, allowSetters = true)
    private Set<AlleleState> alleleStates = new HashSet<>();

    @ShallowReference
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "rel_genomic_indicator__association",
        joinColumns = @JoinColumn(name = "genomic_indicator_id"),
        inverseJoinColumns = @JoinColumn(name = "association_id")
    )
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
    private Set<Association> associations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public GenomicIndicator id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return this.uuid;
    }

    public GenomicIndicator uuid(String uuid) {
        this.setUuid(uuid);
        return this;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getType() {
        return this.type;
    }

    public GenomicIndicator type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return this.name;
    }

    public GenomicIndicator name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public GenomicIndicator description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<AlleleState> getAlleleStates() {
        return this.alleleStates;
    }

    public void setAlleleStates(Set<AlleleState> alleleStates) {
        this.alleleStates = alleleStates;
    }

    public GenomicIndicator alleleStates(Set<AlleleState> alleleStates) {
        this.setAlleleStates(alleleStates);
        return this;
    }

    public GenomicIndicator addAlleleState(AlleleState alleleState) {
        this.alleleStates.add(alleleState);
        alleleState.getGenomicIndicators().add(this);
        return this;
    }

    public GenomicIndicator removeAlleleState(AlleleState alleleState) {
        this.alleleStates.remove(alleleState);
        alleleState.getGenomicIndicators().remove(this);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        this.associations = associations;
    }

    public GenomicIndicator associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public GenomicIndicator addAssociation(Association association) {
        this.associations.add(association);
        association.getGenomicIndicators().add(this);
        return this;
    }

    public GenomicIndicator removeAssociation(Association association) {
        this.associations.remove(association);
        association.getGenomicIndicators().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GenomicIndicator)) {
            return false;
        }
        return id != null && id.equals(((GenomicIndicator) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GenomicIndicator{" +
            "id=" + getId() +
            ", uuid='" + getUuid() + "'" +
            ", type='" + getType() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
