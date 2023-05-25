package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_device_usage_indication__alteration",
        joinColumns = @JoinColumn(name = "device_usage_indication_id"),
        inverseJoinColumns = @JoinColumn(name = "alteration_id")
    )
    @JsonIgnoreProperties(value = { "deviceUsageIndications" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_device_usage_indication__drug",
        joinColumns = @JoinColumn(name = "device_usage_indication_id"),
        inverseJoinColumns = @JoinColumn(name = "drug_id")
    )
    @JsonIgnoreProperties(value = { "fdaDrug", "synonyms", "deviceUsageIndications" }, allowSetters = true)
    private Set<Drug> drugs = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_device_usage_indication__fda_submission",
        joinColumns = @JoinColumn(name = "device_usage_indication_id"),
        inverseJoinColumns = @JoinColumn(name = "fda_submission_id")
    )
    @JsonIgnoreProperties(value = { "companionDiagnosticDevice", "type", "deviceUsageIndications" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "children", "deviceUsageIndications", "parent", "clinicalTrialsGovConditions" }, allowSetters = true)
    private CancerType cancerType;

    @ManyToOne
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes", "deviceUsageIndications", "alterations" }, allowSetters = true)
    private Gene gene;

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

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        this.alterations = alterations;
    }

    public DeviceUsageIndication alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public DeviceUsageIndication addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getDeviceUsageIndications().add(this);
        return this;
    }

    public DeviceUsageIndication removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getDeviceUsageIndications().remove(this);
        return this;
    }

    public Set<Drug> getDrugs() {
        return this.drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        this.drugs = drugs;
    }

    public DeviceUsageIndication drugs(Set<Drug> drugs) {
        this.setDrugs(drugs);
        return this;
    }

    public DeviceUsageIndication addDrug(Drug drug) {
        this.drugs.add(drug);
        drug.getDeviceUsageIndications().add(this);
        return this;
    }

    public DeviceUsageIndication removeDrug(Drug drug) {
        this.drugs.remove(drug);
        drug.getDeviceUsageIndications().remove(this);
        return this;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.fdaSubmissions = fdaSubmissions;
    }

    public DeviceUsageIndication fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public DeviceUsageIndication addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        fdaSubmission.getDeviceUsageIndications().add(this);
        return this;
    }

    public DeviceUsageIndication removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.getDeviceUsageIndications().remove(this);
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

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public DeviceUsageIndication gene(Gene gene) {
        this.setGene(gene);
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
