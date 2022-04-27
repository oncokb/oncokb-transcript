package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;

/**
 * A DeviceUsageIndication.
 */
@Entity
@Table(name = "device_usage_indication")
public class DeviceUsageIndication implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties(value = { "deviceUsageIndications", "companionDiagnosticDevice", "type" }, allowSetters = true)
    private FdaSubmission fdaSubmission;

    @ManyToOne
    @JsonIgnoreProperties(value = { "deviceUsageIndications", "gene", "consequence" }, allowSetters = true)
    private Alteration alteration;

    @ManyToOne
    @JsonIgnoreProperties(value = { "children", "deviceUsageIndications", "parent" }, allowSetters = true)
    private CancerType cancerType;

    @ManyToOne
    @JsonIgnoreProperties(value = { "synonyms", "deviceUsageIndications" }, allowSetters = true)
    private Drug drug;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DeviceUsageIndication id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FdaSubmission getFdaSubmission() {
        return this.fdaSubmission;
    }

    public void setFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmission = fdaSubmission;
    }

    public DeviceUsageIndication fdaSubmission(FdaSubmission fdaSubmission) {
        this.setFdaSubmission(fdaSubmission);
        return this;
    }

    public Alteration getAlteration() {
        return this.alteration;
    }

    public void setAlteration(Alteration alteration) {
        this.alteration = alteration;
    }

    public DeviceUsageIndication alteration(Alteration alteration) {
        this.setAlteration(alteration);
        return this;
    }

    public CancerType getCancerType() {
        return this.cancerType;
    }

    public void setCancerType(CancerType cancerType) {
        this.cancerType = cancerType;
    }

    public DeviceUsageIndication cancerType(CancerType cancerType) {
        this.setCancerType(cancerType);
        return this;
    }

    public Drug getDrug() {
        return this.drug;
    }

    public void setDrug(Drug drug) {
        this.drug = drug;
    }

    public DeviceUsageIndication drug(Drug drug) {
        this.setDrug(drug);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DeviceUsageIndication)) {
            return false;
        }
        return id != null && id.equals(((DeviceUsageIndication) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DeviceUsageIndication{" +
            "id=" + getId() +
            "}";
    }
}
