package org.mskcc.oncokb.transcript.domain;

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
    private Long id;

    @Column(name = "entrez_gene_id")
    private Integer entrezGeneId;

    @Column(name = "hugo_symbol")
    private String hugoSymbol;

    @OneToMany(mappedBy = "gene")
    @JsonIgnoreProperties(value = { "gene" }, allowSetters = true)
    private Set<GeneAlias> geneAliases = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Gene id(Long id) {
        this.id = id;
        return this;
    }

    public Integer getEntrezGeneId() {
        return this.entrezGeneId;
    }

    public Gene entrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
        return this;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getHugoSymbol() {
        return this.hugoSymbol;
    }

    public Gene hugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
        return this;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public Set<GeneAlias> getGeneAliases() {
        return this.geneAliases;
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

    public void setGeneAliases(Set<GeneAlias> geneAliases) {
        if (this.geneAliases != null) {
            this.geneAliases.forEach(i -> i.setGene(null));
        }
        if (geneAliases != null) {
            geneAliases.forEach(i -> i.setGene(this));
        }
        this.geneAliases = geneAliases;
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
            "}";
    }
}
