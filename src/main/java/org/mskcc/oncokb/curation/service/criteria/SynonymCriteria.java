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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Synonym} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.SynonymResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /synonyms?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class SynonymCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter type;

    private StringFilter source;

    private StringFilter code;

    private StringFilter name;

    private LongFilter articleId;

    private LongFilter cancerTypeId;

    private LongFilter geneId;

    private LongFilter nciThesaurusId;

    private Boolean distinct;

    public SynonymCriteria() {}

    public SynonymCriteria(SynonymCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.source = other.source == null ? null : other.source.copy();
        this.code = other.code == null ? null : other.code.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.articleId = other.articleId == null ? null : other.articleId.copy();
        this.cancerTypeId = other.cancerTypeId == null ? null : other.cancerTypeId.copy();
        this.geneId = other.geneId == null ? null : other.geneId.copy();
        this.nciThesaurusId = other.nciThesaurusId == null ? null : other.nciThesaurusId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public SynonymCriteria copy() {
        return new SynonymCriteria(this);
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

    public StringFilter getType() {
        return type;
    }

    public StringFilter type() {
        if (type == null) {
            type = new StringFilter();
        }
        return type;
    }

    public void setType(StringFilter type) {
        this.type = type;
    }

    public StringFilter getSource() {
        return source;
    }

    public StringFilter source() {
        if (source == null) {
            source = new StringFilter();
        }
        return source;
    }

    public void setSource(StringFilter source) {
        this.source = source;
    }

    public StringFilter getCode() {
        return code;
    }

    public StringFilter code() {
        if (code == null) {
            code = new StringFilter();
        }
        return code;
    }

    public void setCode(StringFilter code) {
        this.code = code;
    }

    public StringFilter getName() {
        return name;
    }

    public StringFilter name() {
        if (name == null) {
            name = new StringFilter();
        }
        return name;
    }

    public void setName(StringFilter name) {
        this.name = name;
    }

    public LongFilter getArticleId() {
        return articleId;
    }

    public LongFilter articleId() {
        if (articleId == null) {
            articleId = new LongFilter();
        }
        return articleId;
    }

    public void setArticleId(LongFilter articleId) {
        this.articleId = articleId;
    }

    public LongFilter getCancerTypeId() {
        return cancerTypeId;
    }

    public LongFilter cancerTypeId() {
        if (cancerTypeId == null) {
            cancerTypeId = new LongFilter();
        }
        return cancerTypeId;
    }

    public void setCancerTypeId(LongFilter cancerTypeId) {
        this.cancerTypeId = cancerTypeId;
    }

    public LongFilter getGeneId() {
        return geneId;
    }

    public LongFilter geneId() {
        if (geneId == null) {
            geneId = new LongFilter();
        }
        return geneId;
    }

    public void setGeneId(LongFilter geneId) {
        this.geneId = geneId;
    }

    public LongFilter getNciThesaurusId() {
        return nciThesaurusId;
    }

    public LongFilter nciThesaurusId() {
        if (nciThesaurusId == null) {
            nciThesaurusId = new LongFilter();
        }
        return nciThesaurusId;
    }

    public void setNciThesaurusId(LongFilter nciThesaurusId) {
        this.nciThesaurusId = nciThesaurusId;
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
        final SynonymCriteria that = (SynonymCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(type, that.type) &&
            Objects.equals(source, that.source) &&
            Objects.equals(code, that.code) &&
            Objects.equals(name, that.name) &&
            Objects.equals(articleId, that.articleId) &&
            Objects.equals(cancerTypeId, that.cancerTypeId) &&
            Objects.equals(geneId, that.geneId) &&
            Objects.equals(nciThesaurusId, that.nciThesaurusId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, type, source, code, name, articleId, cancerTypeId, geneId, nciThesaurusId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SynonymCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (source != null ? "source=" + source + ", " : "") +
            (code != null ? "code=" + code + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (articleId != null ? "articleId=" + articleId + ", " : "") +
            (cancerTypeId != null ? "cancerTypeId=" + cancerTypeId + ", " : "") +
            (geneId != null ? "geneId=" + geneId + ", " : "") +
            (nciThesaurusId != null ? "nciThesaurusId=" + nciThesaurusId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
