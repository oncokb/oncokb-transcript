package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

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

    @OneToMany(mappedBy = "alteration", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "alteration" }, allowSetters = true)
    private Set<AlterationReferenceGenome> referenceGenomes = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rel_alteration__gene",
        joinColumns = @JoinColumn(name = "alteration_id"),
        inverseJoinColumns = @JoinColumn(name = "gene_id")
    )
    @JsonIgnoreProperties(value = { "geneAliases", "ensemblGenes", "alterations" }, allowSetters = true)
    private Set<Gene> genes = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "alterations" }, allowSetters = true)
    private Consequence consequence;

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

    public Set<AlterationReferenceGenome> getReferenceGenomes() {
        return this.referenceGenomes;
    }

    public void setReferenceGenomes(Set<AlterationReferenceGenome> alterationReferenceGenomes) {
        if (this.referenceGenomes != null) {
            this.referenceGenomes.forEach(i -> i.setAlteration(null));
        }
        if (alterationReferenceGenomes != null) {
            alterationReferenceGenomes.forEach(i -> i.setAlteration(this));
        }
        this.referenceGenomes = alterationReferenceGenomes;
    }

    public Alteration referenceGenomes(Set<AlterationReferenceGenome> alterationReferenceGenomes) {
        this.setReferenceGenomes(alterationReferenceGenomes);
        return this;
    }

    public Alteration addReferenceGenomes(AlterationReferenceGenome alterationReferenceGenome) {
        this.referenceGenomes.add(alterationReferenceGenome);
        alterationReferenceGenome.setAlteration(this);
        return this;
    }

    public Alteration removeReferenceGenomes(AlterationReferenceGenome alterationReferenceGenome) {
        this.referenceGenomes.remove(alterationReferenceGenome);
        alterationReferenceGenome.setAlteration(null);
        return this;
    }

    public Set<Gene> getGenes() {
        return this.genes;
    }

    public void setGenes(Set<Gene> genes) {
        this.genes = genes;
    }

    public Alteration genes(Set<Gene> genes) {
        this.setGenes(genes);
        return this;
    }

    public Alteration addGene(Gene gene) {
        this.genes.add(gene);
        gene.getAlterations().add(this);
        return this;
    }

    public Alteration removeGene(Gene gene) {
        this.genes.remove(gene);
        gene.getAlterations().remove(this);
        return this;
    }

    public Consequence getConsequence() {
        return this.consequence;
    }

    public void setConsequence(Consequence consequence) {
        this.consequence = consequence;
    }

    public Alteration consequence(Consequence consequence) {
        this.setConsequence(consequence);
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
            ", name='" + getName() + "'" +
            ", alteration='" + getAlteration() + "'" +
            ", proteinStart=" + getProteinStart() +
            ", proteinEnd=" + getProteinEnd() +
            ", refResidues='" + getRefResidues() + "'" +
            ", variantResidues='" + getVariantResidues() + "'" +
            "}";
    }
}
