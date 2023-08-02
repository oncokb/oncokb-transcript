package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;

/**
 * A AlterationReferenceGenome.
 */
@Entity
@Table(name = "alteration_reference_genome")
public class AlterationReferenceGenome implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_genome")
    private ReferenceGenome referenceGenome;

    @ManyToOne
    @JsonIgnoreProperties(value = { "biomarkerAssociations", "referenceGenomes", "genes", "consequence" }, allowSetters = true)
    private Alteration alteration;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AlterationReferenceGenome id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ReferenceGenome getReferenceGenome() {
        return this.referenceGenome;
    }

    public AlterationReferenceGenome referenceGenome(ReferenceGenome referenceGenome) {
        this.setReferenceGenome(referenceGenome);
        return this;
    }

    public void setReferenceGenome(ReferenceGenome referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public Alteration getAlteration() {
        return this.alteration;
    }

    public void setAlteration(Alteration alteration) {
        this.alteration = alteration;
    }

    public AlterationReferenceGenome alteration(Alteration alteration) {
        this.setAlteration(alteration);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AlterationReferenceGenome)) {
            return false;
        }
        return id != null && id.equals(((AlterationReferenceGenome) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AlterationReferenceGenome{" +
            "id=" + getId() +
            ", referenceGenome='" + getReferenceGenome() + "'" +
            "}";
    }
}
