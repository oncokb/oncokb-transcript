package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Gene.
 */
@Entity
@Table(name = "gene")
public class Gene implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "entrez_gene_id")
    private Integer entrezGeneId;

    @Column(name = "hugo_symbol")
    private String hugoSymbol;

    @Column(name = "hgnc_id")
    private String hgncId;

    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "gene" }, allowSetters = true)
    private Set<GeneAlias> geneAliases = new HashSet<>();

    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "transcripts", "gene", "seqRegion" }, allowSetters = true)
    private Set<EnsemblGene> ensemblGenes = new HashSet<>();

    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "alterations", "drugs", "fdaSubmissions", "cancerType", "gene" }, allowSetters = true)
    private Set<BiomarkerAssociation> biomarkerAssociations = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "rel_gene__flag", joinColumns = @JoinColumn(name = "gene_id"), inverseJoinColumns = @JoinColumn(name = "flag_id"))
    @JsonIgnoreProperties(value = { "transcripts", "genes" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @ManyToMany(mappedBy = "genes")
    @JsonIgnoreProperties(value = { "referenceGenomes", "genes", "consequence", "biomarkerAssociations" }, allowSetters = true)
    private Set<Alteration> alterations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Gene id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getEntrezGeneId() {
        return this.entrezGeneId;
    }

    public Gene entrezGeneId(Integer entrezGeneId) {
        this.setEntrezGeneId(entrezGeneId);
        return this;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return this.hugoSymbol;
    }

    public Gene hugoSymbol(String hugoSymbol) {
        this.setHugoSymbol(hugoSymbol);
        return this;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public String getHgncId() {
        return this.hgncId;
    }

    public Gene hgncId(String hgncId) {
        this.setHgncId(hgncId);
        return this;
    }

    public void setHgncId(String hgncId) {
        this.hgncId = hgncId;
    }

    public Set<GeneAlias> getGeneAliases() {
        return this.geneAliases;
    }

    public void setGeneAliases(Set<GeneAlias> geneAliases) {
        if (this.geneAliases != null) {
            this.geneAliases.forEach(i -> i.setGene(null));
        }
        if (geneAliases != null) {
            geneAliases.forEach(i -> i.setGene(this));
        }
        this.geneAliases = geneAliases;
    }

    public Gene geneAliases(Set<GeneAlias> geneAliases) {
        this.setGeneAliases(geneAliases);
        return this;
    }

    public Gene addGeneAlias(GeneAlias geneAlias) {
        this.geneAliases.add(geneAlias);
        geneAlias.setGene(this);
        return this;
    }

    public Gene removeGeneAlias(GeneAlias geneAlias) {
        this.geneAliases.remove(geneAlias);
        geneAlias.setGene(null);
        return this;
    }

    public Set<EnsemblGene> getEnsemblGenes() {
        return this.ensemblGenes;
    }

    public void setEnsemblGenes(Set<EnsemblGene> ensemblGenes) {
        if (this.ensemblGenes != null) {
            this.ensemblGenes.forEach(i -> i.setGene(null));
        }
        if (ensemblGenes != null) {
            ensemblGenes.forEach(i -> i.setGene(this));
        }
        this.ensemblGenes = ensemblGenes;
    }

    public Gene ensemblGenes(Set<EnsemblGene> ensemblGenes) {
        this.setEnsemblGenes(ensemblGenes);
        return this;
    }

    public Gene addEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.add(ensemblGene);
        ensemblGene.setGene(this);
        return this;
    }

    public Gene removeEnsemblGene(EnsemblGene ensemblGene) {
        this.ensemblGenes.remove(ensemblGene);
        ensemblGene.setGene(null);
        return this;
    }

    public Set<BiomarkerAssociation> getBiomarkerAssociations() {
        return this.biomarkerAssociations;
    }

    public void setBiomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        if (this.biomarkerAssociations != null) {
            this.biomarkerAssociations.forEach(i -> i.setGene(null));
        }
        if (biomarkerAssociations != null) {
            biomarkerAssociations.forEach(i -> i.setGene(this));
        }
        this.biomarkerAssociations = biomarkerAssociations;
    }

    public Gene biomarkerAssociations(Set<BiomarkerAssociation> biomarkerAssociations) {
        this.setBiomarkerAssociations(biomarkerAssociations);
        return this;
    }

    public Gene addBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.add(biomarkerAssociation);
        biomarkerAssociation.setGene(this);
        return this;
    }

    public Gene removeBiomarkerAssociation(BiomarkerAssociation biomarkerAssociation) {
        this.biomarkerAssociations.remove(biomarkerAssociation);
        biomarkerAssociation.setGene(null);
        return this;
    }

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Gene flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Gene addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getGenes().add(this);
        return this;
    }

    public Gene removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getGenes().remove(this);
        return this;
    }

    public Set<Alteration> getAlterations() {
        return this.alterations;
    }

    public void setAlterations(Set<Alteration> alterations) {
        if (this.alterations != null) {
            this.alterations.forEach(i -> i.removeGene(this));
        }
        if (alterations != null) {
            alterations.forEach(i -> i.addGene(this));
        }
        this.alterations = alterations;
    }

    public Gene alterations(Set<Alteration> alterations) {
        this.setAlterations(alterations);
        return this;
    }

    public Gene addAlteration(Alteration alteration) {
        this.alterations.add(alteration);
        alteration.getGenes().add(this);
        return this;
    }

    public Gene removeAlteration(Alteration alteration) {
        this.alterations.remove(alteration);
        alteration.getGenes().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Gene)) {
            return false;
        }
        return id != null && id.equals(((Gene) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Gene{" +
            "id=" + getId() +
            ", entrezGeneId=" + getEntrezGeneId() +
            ", hugoSymbol='" + getHugoSymbol() + "'" +
            ", hgncId='" + getHgncId() + "'" +
            "}";
    }
}
