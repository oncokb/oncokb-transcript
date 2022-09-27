package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A Article.
 */
@Entity
@Table(name = "article")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "article")
public class Article implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "pmid", nullable = false)
    private String pmid;

    @Column(name = "pmcid")
    private String pmcid;

    @Column(name = "doi")
    private String doi;

    @Lob
    @Column(name = "title")
    private String title;

    @Lob
    @Column(name = "pub_abstract")
    private String pubAbstract;

    @Column(name = "pub_date")
    private Instant pubDate;

    @Column(name = "journal")
    private String journal;

    @Column(name = "volume")
    private String volume;

    @Column(name = "issue")
    private String issue;

    @Column(name = "pages")
    private String pages;

    @Lob
    @Column(name = "authors")
    private String authors;

    @Lob
    @Column(name = "mesh_terms")
    private String meshTerms;

    @JsonIgnoreProperties(value = { "article" }, allowSetters = true)
    @OneToOne(mappedBy = "article")
    private ArticleFullText fullText;

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

    public String getPmcid() {
        return this.pmcid;
    }

    public Article pmcid(String pmcid) {
        this.setPmcid(pmcid);
        return this;
    }

    public void setPmcid(String pmcid) {
        this.pmcid = pmcid;
    }

    public String getDoi() {
        return this.doi;
    }

    public Article doi(String doi) {
        this.setDoi(doi);
        return this;
    }

    public void setDoi(String doi) {
        this.doi = doi;
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

    public String getPubAbstract() {
        return this.pubAbstract;
    }

    public Article pubAbstract(String pubAbstract) {
        this.setPubAbstract(pubAbstract);
        return this;
    }

    public void setPubAbstract(String pubAbstract) {
        this.pubAbstract = pubAbstract;
    }

    public Instant getPubDate() {
        return this.pubDate;
    }

    public Article pubDate(Instant pubDate) {
        this.setPubDate(pubDate);
        return this;
    }

    public void setPubDate(Instant pubDate) {
        this.pubDate = pubDate;
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

    public String getMeshTerms() {
        return this.meshTerms;
    }

    public Article meshTerms(String meshTerms) {
        this.setMeshTerms(meshTerms);
        return this;
    }

    public void setMeshTerms(String meshTerms) {
        this.meshTerms = meshTerms;
    }

    public ArticleFullText getFullText() {
        return this.fullText;
    }

    public void setFullText(ArticleFullText articleFullText) {
        if (this.fullText != null) {
            this.fullText.setArticle(null);
        }
        if (articleFullText != null) {
            articleFullText.setArticle(this);
        }
        this.fullText = articleFullText;
    }

    public Article fullText(ArticleFullText articleFullText) {
        this.setFullText(articleFullText);
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
            ", pmid='" + getPmid() + "'" +
            ", pmcid='" + getPmcid() + "'" +
            ", doi='" + getDoi() + "'" +
            ", title='" + getTitle() + "'" +
            ", pubAbstract='" + getPubAbstract() + "'" +
            ", pubDate='" + getPubDate() + "'" +
            ", journal='" + getJournal() + "'" +
            ", volume='" + getVolume() + "'" +
            ", issue='" + getIssue() + "'" +
            ", pages='" + getPages() + "'" +
            ", authors='" + getAuthors() + "'" +
            ", meshTerms='" + getMeshTerms() + "'" +
            "}";
    }
}
