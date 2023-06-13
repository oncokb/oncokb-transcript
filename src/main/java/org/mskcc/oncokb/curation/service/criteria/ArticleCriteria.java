package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Article} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.ArticleResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /articles?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class ArticleCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter pmid;

    private StringFilter journal;

    private StringFilter pubDate;

    private StringFilter volume;

    private StringFilter issue;

    private StringFilter pages;

    private StringFilter authors;

    private Boolean distinct;

    public ArticleCriteria() {}

    public ArticleCriteria(ArticleCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.pmid = other.pmid == null ? null : other.pmid.copy();
        this.journal = other.journal == null ? null : other.journal.copy();
        this.pubDate = other.pubDate == null ? null : other.pubDate.copy();
        this.volume = other.volume == null ? null : other.volume.copy();
        this.issue = other.issue == null ? null : other.issue.copy();
        this.pages = other.pages == null ? null : other.pages.copy();
        this.authors = other.authors == null ? null : other.authors.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ArticleCriteria copy() {
        return new ArticleCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public LongFilter id() {
        if (id == null) {
            id = new LongFilter();
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getPmid() {
        return pmid;
    }

    public StringFilter pmid() {
        if (pmid == null) {
            pmid = new StringFilter();
        }
        return pmid;
    }

    public void setPmid(StringFilter pmid) {
        this.pmid = pmid;
    }

    public StringFilter getJournal() {
        return journal;
    }

    public StringFilter journal() {
        if (journal == null) {
            journal = new StringFilter();
        }
        return journal;
    }

    public void setJournal(StringFilter journal) {
        this.journal = journal;
    }

    public StringFilter getPubDate() {
        return pubDate;
    }

    public StringFilter pubDate() {
        if (pubDate == null) {
            pubDate = new StringFilter();
        }
        return pubDate;
    }

    public void setPubDate(StringFilter pubDate) {
        this.pubDate = pubDate;
    }

    public StringFilter getVolume() {
        return volume;
    }

    public StringFilter volume() {
        if (volume == null) {
            volume = new StringFilter();
        }
        return volume;
    }

    public void setVolume(StringFilter volume) {
        this.volume = volume;
    }

    public StringFilter getIssue() {
        return issue;
    }

    public StringFilter issue() {
        if (issue == null) {
            issue = new StringFilter();
        }
        return issue;
    }

    public void setIssue(StringFilter issue) {
        this.issue = issue;
    }

    public StringFilter getPages() {
        return pages;
    }

    public StringFilter pages() {
        if (pages == null) {
            pages = new StringFilter();
        }
        return pages;
    }

    public void setPages(StringFilter pages) {
        this.pages = pages;
    }

    public StringFilter getAuthors() {
        return authors;
    }

    public StringFilter authors() {
        if (authors == null) {
            authors = new StringFilter();
        }
        return authors;
    }

    public void setAuthors(StringFilter authors) {
        this.authors = authors;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final ArticleCriteria that = (ArticleCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(pmid, that.pmid) &&
            Objects.equals(journal, that.journal) &&
            Objects.equals(pubDate, that.pubDate) &&
            Objects.equals(volume, that.volume) &&
            Objects.equals(issue, that.issue) &&
            Objects.equals(pages, that.pages) &&
            Objects.equals(authors, that.authors) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, pmid, journal, pubDate, volume, issue, pages, authors, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ArticleCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (pmid != null ? "pmid=" + pmid + ", " : "") +
            (journal != null ? "journal=" + journal + ", " : "") +
            (pubDate != null ? "pubDate=" + pubDate + ", " : "") +
            (volume != null ? "volume=" + volume + ", " : "") +
            (issue != null ? "issue=" + issue + ", " : "") +
            (pages != null ? "pages=" + pages + ", " : "") +
            (authors != null ? "authors=" + authors + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
