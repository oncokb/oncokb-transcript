package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A NciThesaurus.
 */
@Entity
@Table(name = "nci_thesaurus")
public class NciThesaurus implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "version", nullable = false)
    private String version;

    @NotNull
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "preferred_name")
    private String preferredName;

    @Column(name = "display_name")
    private String displayName;

    @ManyToMany
    @JoinTable(
        name = "rel_nci_thesaurus__synonym",
        joinColumns = @JoinColumn(name = "nci_thesaurus_id"),
        inverseJoinColumns = @JoinColumn(name = "synonym_id")
    )
    @JsonIgnoreProperties(value = { "cancerTypes", "genes", "nciThesauruses" }, allowSetters = true)
    private Set<Synonym> synonyms = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public NciThesaurus id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVersion() {
        return this.version;
    }

    public NciThesaurus version(String version) {
        this.setVersion(version);
        return this;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCode() {
        return this.code;
    }

    public NciThesaurus code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getPreferredName() {
        return this.preferredName;
    }

    public NciThesaurus preferredName(String preferredName) {
        this.setPreferredName(preferredName);
        return this;
    }

    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName;
    }

    public String getDisplayName() {
        return this.displayName;
    }

    public NciThesaurus displayName(String displayName) {
        this.setDisplayName(displayName);
        return this;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Set<Synonym> getSynonyms() {
        return this.synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    public NciThesaurus synonyms(Set<Synonym> synonyms) {
        this.setSynonyms(synonyms);
        return this;
    }

    public NciThesaurus addSynonym(Synonym synonym) {
        this.synonyms.add(synonym);
        synonym.getNciThesauruses().add(this);
        return this;
    }

    public NciThesaurus removeSynonym(Synonym synonym) {
        this.synonyms.remove(synonym);
        synonym.getNciThesauruses().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NciThesaurus)) {
            return false;
        }
        return id != null && id.equals(((NciThesaurus) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NciThesaurus{" +
            "id=" + getId() +
            ", version='" + getVersion() + "'" +
            ", code='" + getCode() + "'" +
            ", preferredName='" + getPreferredName() + "'" +
            ", displayName='" + getDisplayName() + "'" +
            "}";
    }
}
