package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;

/**
 * A Synonym.
 */
@Entity
@Table(name = "synonym")
public class Synonym implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "code")
    private String code;

    @Column(name = "name")
    private String name;

    @Lob
    @Column(name = "note")
    private String note;

    @ManyToMany(mappedBy = "synonyms")
    @JsonIgnoreProperties(value = { "associationCancerTypes", "children", "synonyms", "parent" }, allowSetters = true)
    private Set<CancerType> cancerTypes = new HashSet<>();

    @ManyToMany(mappedBy = "synonyms")
    @JsonIgnoreProperties(value = { "ensemblGenes", "transcripts", "flags", "synonyms", "alterations" }, allowSetters = true)
    private Set<Gene> genes = new HashSet<>();

    @ManyToMany(mappedBy = "synonyms")
    @JsonIgnoreProperties(value = { "synonyms" }, allowSetters = true)
    private Set<NciThesaurus> nciThesauruses = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Synonym id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public Synonym type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSource() {
        return this.source;
    }

    public Synonym source(String source) {
        this.setSource(source);
        return this;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getCode() {
        return this.code;
    }

    public Synonym code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return this.name;
    }

    public Synonym name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNote() {
        return this.note;
    }

    public Synonym note(String note) {
        this.setNote(note);
        return this;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Set<CancerType> getCancerTypes() {
        return this.cancerTypes;
    }

    public void setCancerTypes(Set<CancerType> cancerTypes) {
        if (this.cancerTypes != null) {
            this.cancerTypes.forEach(i -> i.removeSynonym(this));
        }
        if (cancerTypes != null) {
            cancerTypes.forEach(i -> i.addSynonym(this));
        }
        this.cancerTypes = cancerTypes;
    }

    public Synonym cancerTypes(Set<CancerType> cancerTypes) {
        this.setCancerTypes(cancerTypes);
        return this;
    }

    public Synonym addCancerType(CancerType cancerType) {
        this.cancerTypes.add(cancerType);
        cancerType.getSynonyms().add(this);
        return this;
    }

    public Synonym removeCancerType(CancerType cancerType) {
        this.cancerTypes.remove(cancerType);
        cancerType.getSynonyms().remove(this);
        return this;
    }

    public Set<Gene> getGenes() {
        return this.genes;
    }

    public void setGenes(Set<Gene> genes) {
        if (this.genes != null) {
            this.genes.forEach(i -> i.removeSynonym(this));
        }
        if (genes != null) {
            genes.forEach(i -> i.addSynonym(this));
        }
        this.genes = genes;
    }

    public Synonym genes(Set<Gene> genes) {
        this.setGenes(genes);
        return this;
    }

    public Synonym addGene(Gene gene) {
        this.genes.add(gene);
        gene.getSynonyms().add(this);
        return this;
    }

    public Synonym removeGene(Gene gene) {
        this.genes.remove(gene);
        gene.getSynonyms().remove(this);
        return this;
    }

    public Set<NciThesaurus> getNciThesauruses() {
        return this.nciThesauruses;
    }

    public void setNciThesauruses(Set<NciThesaurus> nciThesauruses) {
        if (this.nciThesauruses != null) {
            this.nciThesauruses.forEach(i -> i.removeSynonym(this));
        }
        if (nciThesauruses != null) {
            nciThesauruses.forEach(i -> i.addSynonym(this));
        }
        this.nciThesauruses = nciThesauruses;
    }

    public Synonym nciThesauruses(Set<NciThesaurus> nciThesauruses) {
        this.setNciThesauruses(nciThesauruses);
        return this;
    }

    public Synonym addNciThesaurus(NciThesaurus nciThesaurus) {
        this.nciThesauruses.add(nciThesaurus);
        nciThesaurus.getSynonyms().add(this);
        return this;
    }

    public Synonym removeNciThesaurus(NciThesaurus nciThesaurus) {
        this.nciThesauruses.remove(nciThesaurus);
        nciThesaurus.getSynonyms().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Synonym)) {
            return false;
        }
        return id != null && id.equals(((Synonym) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Synonym{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", source='" + getSource() + "'" +
            ", code='" + getCode() + "'" +
            ", name='" + getName() + "'" +
            ", note='" + getNote() + "'" +
            "}";
    }
}
