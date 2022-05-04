package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A CompanionDiagnosticDevice.
 */
@Entity
@Table(name = "companion_diagnostic_device")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "companiondiagnosticdevice")
public class CompanionDiagnosticDevice implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "manufacturer", nullable = false)
    private String manufacturer;

    @OneToMany(mappedBy = "companionDiagnosticDevice", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "companionDiagnosticDevice" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_companion_diagnostic_device__specimen_type",
        joinColumns = @JoinColumn(name = "companion_diagnostic_device_id"),
        inverseJoinColumns = @JoinColumn(name = "specimen_type_id")
    )
    @JsonIgnoreProperties(value = { "companionDiagnosticDevices" }, allowSetters = true)
    private Set<SpecimenType> specimenTypes = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CompanionDiagnosticDevice id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public CompanionDiagnosticDevice name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return this.manufacturer;
    }

    public CompanionDiagnosticDevice manufacturer(String manufacturer) {
        this.setManufacturer(manufacturer);
        return this;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        if (this.fdaSubmissions != null) {
            this.fdaSubmissions.forEach(i -> i.setCompanionDiagnosticDevice(null));
        }
        if (fdaSubmissions != null) {
            fdaSubmissions.forEach(i -> i.setCompanionDiagnosticDevice(this));
        }
        this.fdaSubmissions = fdaSubmissions;
    }

    public CompanionDiagnosticDevice fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public CompanionDiagnosticDevice addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        fdaSubmission.setCompanionDiagnosticDevice(this);
        return this;
    }

    public CompanionDiagnosticDevice removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.setCompanionDiagnosticDevice(null);
        return this;
    }

    public Set<SpecimenType> getSpecimenTypes() {
        return this.specimenTypes;
    }

    public void setSpecimenTypes(Set<SpecimenType> specimenTypes) {
        this.specimenTypes = specimenTypes;
    }

    public CompanionDiagnosticDevice specimenTypes(Set<SpecimenType> specimenTypes) {
        this.setSpecimenTypes(specimenTypes);
        return this;
    }

    public CompanionDiagnosticDevice addSpecimenType(SpecimenType specimenType) {
        this.specimenTypes.add(specimenType);
        specimenType.getCompanionDiagnosticDevices().add(this);
        return this;
    }

    public CompanionDiagnosticDevice removeSpecimenType(SpecimenType specimenType) {
        this.specimenTypes.remove(specimenType);
        specimenType.getCompanionDiagnosticDevices().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CompanionDiagnosticDevice)) {
            return false;
        }
        return id != null && id.equals(((CompanionDiagnosticDevice) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CompanionDiagnosticDevice{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", manufacturer='" + getManufacturer() + "'" +
            "}";
    }
}
