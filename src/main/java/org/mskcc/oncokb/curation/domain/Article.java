package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.javers.core.metamodel.annotation.DiffIgnore;
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

    @Lob
    @Column(name = "content")
    private String content;

    @Column(name = "link")
    private String link;

    @Column(name = "pmid")
    private String pmid;

    @Column(name = "elocation_id")
    private String elocationId;

    @Lob
    @Column(name = "title")
    private String title;

    @Column(name = "authors")
    private String authors;

    @Column(name = "journal")
    private String journal;

    @Column(name = "volume")
    private String volume;

    @Column(name = "issue")
    private String issue;

    @Column(name = "pages")
    private String pages;

    @Column(name = "pub_date")
    private String pubDate;

    @DiffIgnore
    @ManyToMany(mappedBy = "articles")
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

    public String getPmid() {
        return this.pmid;
    }

    public Article pmid(String pmid) {
        this.setPmid(pmid);
        return this;
    }

    public void setPmid(String pmid) {
        this.pmid = pmid;
    }

    public String getElocationId() {
        return this.elocationId;
    }

    public Article elocationId(String elocationId) {
        this.setElocationId(elocationId);
        return this;
    }

    public void setElocationId(String elocationId) {
        this.elocationId = elocationId;
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

    public String getJournal() {
        return this.journal;
    }

    public Article journal(String journal) {
        this.setJournal(journal);
        return this;
    }

    public void setJournal(String journal) {
        this.journal = journal;
    }

    public String getVolume() {
        return this.volume;
    }

    public Article volume(String volume) {
        this.setVolume(volume);
        return this;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getIssue() {
        return this.issue;
    }

    public Article issue(String issue) {
        this.setIssue(issue);
        return this;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getPages() {
        return this.pages;
    }

    public Article pages(String pages) {
        this.setPages(pages);
        return this;
    }

    public void setPages(String pages) {
        this.pages = pages;
    }

    public String getPubDate() {
        return this.pubDate;
    }

    public Article pubDate(String pubDate) {
        this.setPubDate(pubDate);
        return this;
    }

    public void setPubDate(String pubDate) {
        this.pubDate = pubDate;
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
            ", content='" + getContent() + "'" +
            ", link='" + getLink() + "'" +
            ", pmid='" + getPmid() + "'" +
            ", elocationId='" + getElocationId() + "'" +
            ", title='" + getTitle() + "'" +
            ", authors='" + getAuthors() + "'" +
            ", journal='" + getJournal() + "'" +
            ", volume='" + getVolume() + "'" +
            ", issue='" + getIssue() + "'" +
            ", pages='" + getPages() + "'" +
            ", pubDate='" + getPubDate() + "'" +
            "}";
    }
}
