package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;

/**
 * A Alteration.
 */
@Entity
@Table(name = "alteration")
public class Alteration implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AlterationType type;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "alteration", nullable = false)
    private String alteration;

    @Column(name = "protein_start")
    private Integer proteinStart;

    @Column(name = "protein_end")
    private Integer proteinEnd;

    @Column(name = "ref_residues")
    private String refResidues;

    @Column(name = "variant_residues")
    private String variantResidues;

    @OneToMany(mappedBy = "alteration")
    @JsonIgnoreProperties(value = { "fdaSubmission", "alteration", "cancerType", "drug" }, allowSetters = true)
    private Set<DeviceUsageIndication> deviceUsageIndications = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes", "alterations" }, allowSetters = true)
    private Gene gene;

    @ManyToOne
    @JsonIgnoreProperties(value = { "alterations" }, allowSetters = true)
    private VariantConsequence consequence;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Alteration id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AlterationType getType() {
        return this.type;
    }

    public Alteration type(AlterationType type) {
        this.setType(type);
        return this;
    }

    public void setType(AlterationType type) {
        this.type = type;
    }

    public String getName() {
        return this.name;
    }

    public Alteration name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAlteration() {
        return this.alteration;
    }

    public Alteration alteration(String alteration) {
        this.setAlteration(alteration);
        return this;
    }

    public void setAlteration(String alteration) {
        this.alteration = alteration;
    }

    public Integer getProteinStart() {
        return this.proteinStart;
    }

    public Alteration proteinStart(Integer proteinStart) {
        this.setProteinStart(proteinStart);
        return this;
    }

    public void setProteinStart(Integer proteinStart) {
        this.proteinStart = proteinStart;
    }

    public Integer getProteinEnd() {
        return this.proteinEnd;
    }

    public Alteration proteinEnd(Integer proteinEnd) {
        this.setProteinEnd(proteinEnd);
        return this;
    }

    public void setProteinEnd(Integer proteinEnd) {
        this.proteinEnd = proteinEnd;
    }

    public String getRefResidues() {
        return this.refResidues;
    }

    public Alteration refResidues(String refResidues) {
        this.setRefResidues(refResidues);
        return this;
    }

    public void setRefResidues(String refResidues) {
        this.refResidues = refResidues;
    }

    public String getVariantResidues() {
        return this.variantResidues;
    }

    public Alteration variantResidues(String variantResidues) {
        this.setVariantResidues(variantResidues);
        return this;
    }

    public void setVariantResidues(String variantResidues) {
        this.variantResidues = variantResidues;
    }

    public Set<DeviceUsageIndication> getDeviceUsageIndications() {
        return this.deviceUsageIndications;
    }

    public void setDeviceUsageIndications(Set<DeviceUsageIndication> deviceUsageIndications) {
        if (this.deviceUsageIndications != null) {
            this.deviceUsageIndications.forEach(i -> i.setAlteration(null));
        }
        if (deviceUsageIndications != null) {
            deviceUsageIndications.forEach(i -> i.setAlteration(this));
        }
        this.deviceUsageIndications = deviceUsageIndications;
    }

    public Alteration deviceUsageIndications(Set<DeviceUsageIndication> deviceUsageIndications) {
        this.setDeviceUsageIndications(deviceUsageIndications);
        return this;
    }

    public Alteration addDeviceUsageIndication(DeviceUsageIndication deviceUsageIndication) {
        this.deviceUsageIndications.add(deviceUsageIndication);
        deviceUsageIndication.setAlteration(this);
        return this;
    }

    public Alteration removeDeviceUsageIndication(DeviceUsageIndication deviceUsageIndication) {
        this.deviceUsageIndications.remove(deviceUsageIndication);
        deviceUsageIndication.setAlteration(null);
        return this;
    }

    public Gene getGene() {
        return this.gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }

    public Alteration gene(Gene gene) {
        this.setGene(gene);
        return this;
    }

    public VariantConsequence getConsequence() {
        return this.consequence;
    }

    public void setConsequence(VariantConsequence variantConsequence) {
        this.consequence = variantConsequence;
    }

    public Alteration consequence(VariantConsequence variantConsequence) {
        this.setConsequence(variantConsequence);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Alteration)) {
            return false;
        }
        return id != null && id.equals(((Alteration) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Alteration{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", name='" + getName() + "'" +
            ", alteration='" + getAlteration() + "'" +
            ", proteinStart=" + getProteinStart() +
            ", proteinEnd=" + getProteinEnd() +
            ", refResidues='" + getRefResidues() + "'" +
            ", variantResidues='" + getVariantResidues() + "'" +
            "}";
    }
}
