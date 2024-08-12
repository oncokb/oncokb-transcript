package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;

/**
 * A Drug.
 */
@Entity
@Table(name = "drug")
public class Drug implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    @Lob
    @Column(name = "name", nullable = false)
    private String name;

    @OneToOne
    @JoinColumn(unique = true, name = "ncit_code", referencedColumnName = "code")
    private NciThesaurus nciThesaurus;

    @ShallowReference
    @OneToMany(mappedBy = "drug")
    @JsonIgnoreProperties(value = { "fdaSubmissions", "drug" }, allowSetters = true)
    private Set<FdaDrug> fdaDrugs = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "rel_drug__flag", joinColumns = @JoinColumn(name = "drug_id"), inverseJoinColumns = @JoinColumn(name = "flag_id"))
    @JsonIgnoreProperties(value = { "alterations", "articles", "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "drugs")
    @JsonIgnoreProperties(
        value = { "evidence", "clinicalTrials", "clinicalTrialArms", "eligibilityCriteria", "fdaSubmissions", "genomicIndicators" },
        allowSetters = true
    )
    private Set<Association> associations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Drug id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return this.uuid;
    }

    public Drug uuid(String uuid) {
        this.setUuid(uuid);
        return this;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return this.name;
    }

    public Drug name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public NciThesaurus getNciThesaurus() {
        return this.nciThesaurus;
    }

    public void setNciThesaurus(NciThesaurus nciThesaurus) {
        this.nciThesaurus = nciThesaurus;
    }

    public Drug nciThesaurus(NciThesaurus nciThesaurus) {
        this.setNciThesaurus(nciThesaurus);
        return this;
    }

    public Set<FdaDrug> getFdaDrugs() {
        return this.fdaDrugs;
    }

    public void setFdaDrugs(Set<FdaDrug> fdaDrugs) {
        if (this.fdaDrugs != null) {
            this.fdaDrugs.forEach(i -> i.setDrug(null));
        }
        if (fdaDrugs != null) {
            fdaDrugs.forEach(i -> i.setDrug(this));
        }
        this.fdaDrugs = fdaDrugs;
    }

    public Drug fdaDrugs(Set<FdaDrug> fdaDrugs) {
        this.setFdaDrugs(fdaDrugs);
        return this;
    }

    public Drug addFdaDrug(FdaDrug fdaDrug) {
        this.fdaDrugs.add(fdaDrug);
        fdaDrug.setDrug(this);
        return this;
    }

    public Drug removeFdaDrug(FdaDrug fdaDrug) {
        this.fdaDrugs.remove(fdaDrug);
        fdaDrug.setDrug(null);
        return this;
    }

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Drug flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Drug addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getDrugs().add(this);
        return this;
    }

    public Drug removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getDrugs().remove(this);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        if (this.associations != null) {
            this.associations.forEach(i -> i.removeDrug(this));
        }
        if (associations != null) {
            associations.forEach(i -> i.addDrug(this));
        }
        this.associations = associations;
    }

    public Drug associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public Drug addAssociation(Association association) {
        this.associations.add(association);
        association.getDrugs().add(this);
        return this;
    }

    public Drug removeAssociation(Association association) {
        this.associations.remove(association);
        association.getDrugs().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Drug)) {
            return false;
        }
        return id != null && id.equals(((Drug) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Drug{" +
            "id=" + getId() +
            ", uuid='" + getUuid() + "'" +
            ", name='" + getName() + "'" +
            "}";
    }
}
