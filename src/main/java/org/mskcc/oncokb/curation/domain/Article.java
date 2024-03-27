package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.javers.core.metamodel.annotation.ShallowReference;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;

/**
 * A Article.
 */
@Entity
@Table(name = "article")
public class Article implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ArticleType type;

    @Column(name = "uid")
    private String uid;

    @Lob
    @Column(name = "title")
    private String title;

    @DiffIgnore
    @Lob
    @Column(name = "content")
    private String content;

    @Column(name = "link")
    private String link;

    @Column(name = "authors")
    private String authors;

    @Column(name = "date")
    private Instant date;

    @DiffIgnore
    @Lob
    @Column(name = "additional_info")
    private String additionalInfo;

    @ShallowReference
    @ManyToMany
    @JoinTable(
        name = "rel_article__flag",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "flag_id")
    )
    @JsonIgnoreProperties(value = { "alterations", "articles", "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @DiffIgnore
    @ManyToMany
    @JoinTable(
        name = "rel_article__synonym",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "synonym_id")
    )
    @JsonIgnoreProperties(value = { "articles", "cancerTypes", "genes", "nciThesauruses" }, allowSetters = true)
    private Set<Synonym> synonyms = new HashSet<>();

    @DiffIgnore
    @ManyToMany(mappedBy = "articles")
    @JsonIgnoreProperties(
        value = {
            "rules",
            "alterations",
            "articles",
            "cancerTypes",
            "drugs",
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

    @DiffIgnore
    @ManyToMany(mappedBy = "articles")
    @JsonIgnoreProperties(value = { "articles", "associations", "companionDiagnosticDevice", "fdaDrug", "type" }, allowSetters = true)
    private Set<FdaSubmission> fdaSubmissions = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Article id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ArticleType getType() {
        return this.type;
    }

    public Article type(ArticleType type) {
        this.setType(type);
        return this;
    }

    public void setType(ArticleType type) {
        this.type = type;
    }

    public String getUid() {
        return this.uid;
    }

    public Article uid(String uid) {
        this.setUid(uid);
        return this;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getTitle() {
        return this.title;
    }

    public Article title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return this.content;
    }

    public Article content(String content) {
        this.setContent(content);
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLink() {
        return this.link;
    }

    public Article link(String link) {
        this.setLink(link);
        return this;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getAuthors() {
        return this.authors;
    }

    public Article authors(String authors) {
        this.setAuthors(authors);
        return this;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public Instant getDate() {
        return this.date;
    }

    public Article date(Instant date) {
        this.setDate(date);
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Set<Flag> getFlags() {
        return this.flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Article flags(Set<Flag> flags) {
        this.setFlags(flags);
        return this;
    }

    public Article addFlag(Flag flag) {
        this.flags.add(flag);
        flag.getArticles().add(this);
        return this;
    }

    public Article removeFlag(Flag flag) {
        this.flags.remove(flag);
        flag.getArticles().remove(this);
        return this;
    }

    public Set<Synonym> getSynonyms() {
        return this.synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    public Article synonyms(Set<Synonym> synonyms) {
        this.setSynonyms(synonyms);
        return this;
    }

    public Article addSynonym(Synonym synonym) {
        this.synonyms.add(synonym);
        synonym.getArticles().add(this);
        return this;
    }

    public Article removeSynonym(Synonym synonym) {
        this.synonyms.remove(synonym);
        synonym.getArticles().remove(this);
        return this;
    }

    public Set<Association> getAssociations() {
        return this.associations;
    }

    public void setAssociations(Set<Association> associations) {
        if (this.associations != null) {
            this.associations.forEach(i -> i.removeArticle(this));
        }
        if (associations != null) {
            associations.forEach(i -> i.addArticle(this));
        }
        this.associations = associations;
    }

    public Article associations(Set<Association> associations) {
        this.setAssociations(associations);
        return this;
    }

    public Article addAssociation(Association association) {
        this.associations.add(association);
        association.getArticles().add(this);
        return this;
    }

    public Article removeAssociation(Association association) {
        this.associations.remove(association);
        association.getArticles().remove(this);
        return this;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public Set<FdaSubmission> getFdaSubmissions() {
        return this.fdaSubmissions;
    }

    public void setFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        if (this.fdaSubmissions != null) {
            this.fdaSubmissions.forEach(i -> i.removeArticle(this));
        }
        if (fdaSubmissions != null) {
            fdaSubmissions.forEach(i -> i.addArticle(this));
        }
        this.fdaSubmissions = fdaSubmissions;
    }

    public Article fdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        this.setFdaSubmissions(fdaSubmissions);
        return this;
    }

    public Article addFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.add(fdaSubmission);
        fdaSubmission.getArticles().add(this);
        return this;
    }

    public Article removeFdaSubmission(FdaSubmission fdaSubmission) {
        this.fdaSubmissions.remove(fdaSubmission);
        fdaSubmission.getArticles().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Article)) {
            return false;
        }
        return id != null && id.equals(((Article) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Article{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", uid='" + getUid() + "'" +
            ", title='" + getTitle() + "'" +
            ", content='" + getContent() + "'" +
            ", link='" + getLink() + "'" +
            ", authors='" + getAuthors() + "'" +
            ", date='" + getDate() + "'" +
            "}";
    }
}
