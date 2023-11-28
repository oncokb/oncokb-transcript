package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.annotations.ApiModel;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;

/**
 * A Alteration.
 */
@ApiModel(description = "Entity")
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

    @NotNull
    @Column(name = "protein_change", nullable = false)
    private String proteinChange;

    @Column(name = "start")
    private Integer start;

    @Column(name = "end")
    private Integer end;

    @Column(name = "ref_residues")
    private String refResidues;

    @Column(name = "variant_residues")
    private String variantResidues;

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_alteration__gene",
        joinColumns = @JoinColumn(name = "alteration_id"),
        inverseJoinColumns = @JoinColumn(name = "gene_id")
    )
    @JsonIgnoreProperties(value = { "ensemblGenes", "transcripts", "flags", "synonyms", "alterations" }, allowSetters = true)
    private Set<Gene> genes = new HashSet<>();

    @DiffIgnore
    @ManyToMany
    @JoinTable(
        name = "rel_alteration__transcript",
        joinColumns = @JoinColumn(name = "alteration_id"),
        inverseJoinColumns = @JoinColumn(name = "transcript_id")
    )
    @JsonIgnoreProperties(value = { "sequences", "fragments", "flags", "ensemblGene", "gene", "alterations" }, allowSetters = true)
    private Set<Transcript> transcripts = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "alterations" }, allowSetters = true)
    private Consequence consequence;

    @DiffIgnore
    @ManyToMany(mappedBy = "alterations")
    @JsonIgnoreProperties(
        value = {
            "associationCancerTypes",
            "alterations",
            "articles",
            "treatments",
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

    public String getProteinChange() {
        return this.proteinChange;
    }

    public Alteration proteinChange(String proteinChange) {
        this.setProteinChange(proteinChange);
        return this;
    }

    public void setProteinChange(String proteinChange) {
        this.proteinChange = proteinChange;
    }

    public Integer getStart() {
        return this.start;
    }

    public Alteration start(Integer start) {
        this.setStart(start);
        return this;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return this.end;
    }

    public Alteration end(Integer end) {
        this.setEnd(end);
        return this;
    }

    public void setEnd(Integer end) {
        this.end = end;
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

    public Set<Transcript> getTranscripts() {
        return this.transcripts;
    }

    public void setTranscripts(Set<Transcript> transcripts) {
        this.transcripts = transcripts;
    }

    public Alteration transcripts(Set<Transcript> transcripts) {
        this.setTranscripts(transcripts);
        return this;
    }

    public Alteration addTranscript(Transcript transcript) {
        this.transcripts.add(transcript);
        transcript.getAlterations().add(this);
        return this;
    }

    public Alteration removeTranscript(Transcript transcript) {
        this.transcripts.remove(transcript);
        transcript.getAlterations().remove(this);
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

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        if (this.associations != null) {
            this.associations.forEach(i -> i.removeAlteration(this));
        }
        if (associations != null) {
            associations.forEach(i -> i.addAlteration(this));
        }
        this.associations = associations;
    }

    public Alteration associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public Alteration addAssociation(Association association) {
        this.associations.add(association);
        association.getAlterations().add(this);
        return this;
    }

    public Alteration removeAssociation(Association association) {
        this.associations.remove(association);
        association.getAlterations().remove(this);
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
            ", proteinChange='" + getProteinChange() + "'" +
            ", start=" + getStart() +
            ", end=" + getEnd() +
            ", refResidues='" + getRefResidues() + "'" +
            ", variantResidues='" + getVariantResidues() + "'" +
            "}";
    }
}
