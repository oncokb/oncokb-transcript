package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.InstantFilter;
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

    /**
     * Class for filtering ArticleType
     */
    public static class ArticleTypeFilter extends Filter<ArticleType> {

        public ArticleTypeFilter() {}

        public ArticleTypeFilter(ArticleTypeFilter filter) {
            super(filter);
        }

        @Override
        public ArticleTypeFilter copy() {
            return new ArticleTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private ArticleTypeFilter type;

    private StringFilter uid;

    private StringFilter link;

    private StringFilter authors;

    private InstantFilter date;

    private LongFilter flagId;

    private LongFilter synonymId;

    private LongFilter associationId;

    private Boolean distinct;

    public ArticleCriteria() {}

    public ArticleCriteria(ArticleCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.uid = other.uid == null ? null : other.uid.copy();
        this.link = other.link == null ? null : other.link.copy();
        this.authors = other.authors == null ? null : other.authors.copy();
        this.date = other.date == null ? null : other.date.copy();
        this.flagId = other.flagId == null ? null : other.flagId.copy();
        this.synonymId = other.synonymId == null ? null : other.synonymId.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
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

    public ArticleTypeFilter getType() {
        return type;
    }

    public ArticleTypeFilter type() {
        if (type == null) {
            type = new ArticleTypeFilter();
        }
        return type;
    }

    public void setType(ArticleTypeFilter type) {
        this.type = type;
    }

    public StringFilter getUid() {
        return uid;
    }

    public StringFilter uid() {
        if (uid == null) {
            uid = new StringFilter();
        }
        return uid;
    }

    public void setUid(StringFilter uid) {
        this.uid = uid;
    }

    public StringFilter getLink() {
        return link;
    }

    public StringFilter link() {
        if (link == null) {
            link = new StringFilter();
        }
        return link;
    }

    public void setLink(StringFilter link) {
        this.link = link;
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

    public InstantFilter getDate() {
        return date;
    }

    public InstantFilter date() {
        if (date == null) {
            date = new InstantFilter();
        }
        return date;
    }

    public void setDate(InstantFilter date) {
        this.date = date;
    }

    public LongFilter getFlagId() {
        return flagId;
    }

    public LongFilter flagId() {
        if (flagId == null) {
            flagId = new LongFilter();
        }
        return flagId;
    }

    public void setFlagId(LongFilter flagId) {
        this.flagId = flagId;
    }

    public LongFilter getSynonymId() {
        return synonymId;
    }

    public LongFilter synonymId() {
        if (synonymId == null) {
            synonymId = new LongFilter();
        }
        return synonymId;
    }

    public void setSynonymId(LongFilter synonymId) {
        this.synonymId = synonymId;
    }

    public LongFilter getAssociationId() {
        return associationId;
    }

    public LongFilter associationId() {
        if (associationId == null) {
            associationId = new LongFilter();
        }
        return associationId;
    }

    public void setAssociationId(LongFilter associationId) {
        this.associationId = associationId;
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
            Objects.equals(type, that.type) &&
            Objects.equals(uid, that.uid) &&
            Objects.equals(link, that.link) &&
            Objects.equals(authors, that.authors) &&
            Objects.equals(date, that.date) &&
            Objects.equals(flagId, that.flagId) &&
            Objects.equals(synonymId, that.synonymId) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, type, uid, link, authors, date, flagId, synonymId, associationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ArticleCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (uid != null ? "uid=" + uid + ", " : "") +
            (link != null ? "link=" + link + ", " : "") +
            (authors != null ? "authors=" + authors + ", " : "") +
            (date != null ? "date=" + date + ", " : "") +
            (flagId != null ? "flagId=" + flagId + ", " : "") +
            (synonymId != null ? "synonymId=" + synonymId + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
