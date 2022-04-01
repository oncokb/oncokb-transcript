package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A SpecimenType.
 */
@Entity
@Table(name = "specimen_type")
public class SpecimenType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @ManyToMany(mappedBy = "specimenTypes")
    @JsonIgnoreProperties(value = { "fdaSubmissions", "specimenTypes" }, allowSetters = true)
    private Set<CompanionDiagnosticDevice> companionDiagnosticDevices = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SpecimenType id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public SpecimenType type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Set<CompanionDiagnosticDevice> getCompanionDiagnosticDevices() {
        return this.companionDiagnosticDevices;
    }

    public void setCompanionDiagnosticDevices(Set<CompanionDiagnosticDevice> companionDiagnosticDevices) {
        if (this.companionDiagnosticDevices != null) {
            this.companionDiagnosticDevices.forEach(i -> i.removeSpecimenType(this));
        }
        if (companionDiagnosticDevices != null) {
            companionDiagnosticDevices.forEach(i -> i.addSpecimenType(this));
        }
        this.companionDiagnosticDevices = companionDiagnosticDevices;
    }

    public SpecimenType companionDiagnosticDevices(Set<CompanionDiagnosticDevice> companionDiagnosticDevices) {
        this.setCompanionDiagnosticDevices(companionDiagnosticDevices);
        return this;
    }

    public SpecimenType addCompanionDiagnosticDevice(CompanionDiagnosticDevice companionDiagnosticDevice) {
        this.companionDiagnosticDevices.add(companionDiagnosticDevice);
        companionDiagnosticDevice.getSpecimenTypes().add(this);
        return this;
    }

    public SpecimenType removeCompanionDiagnosticDevice(CompanionDiagnosticDevice companionDiagnosticDevice) {
        this.companionDiagnosticDevices.remove(companionDiagnosticDevice);
        companionDiagnosticDevice.getSpecimenTypes().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SpecimenType)) {
            return false;
        }
        return id != null && id.equals(((SpecimenType) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SpecimenType{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            "}";
    }
}
