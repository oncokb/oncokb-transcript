package org.mskcc.oncokb.curation.domain;

import java.io.Serializable;
import javax.persistence.*;

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

    @Column(name = "pmid")
    private String pmid;

    @Lob
    @Column(name = "title")
    private String title;

    @Column(name = "journal")
    private String journal;

    @Column(name = "pub_date")
    private String pubDate;

    @Column(name = "volume")
    private String volume;

    @Column(name = "issue")
    private String issue;

    @Column(name = "pages")
    private String pages;

    @Column(name = "authors")
    private String authors;

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
            ", title='" + getTitle() + "'" +
            ", journal='" + getJournal() + "'" +
            ", pubDate='" + getPubDate() + "'" +
            ", volume='" + getVolume() + "'" +
            ", issue='" + getIssue() + "'" +
            ", pages='" + getPages() + "'" +
            ", authors='" + getAuthors() + "'" +
            "}";
    }
}
