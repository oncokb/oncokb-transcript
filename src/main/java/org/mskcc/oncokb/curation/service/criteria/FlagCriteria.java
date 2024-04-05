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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Flag} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.FlagResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /flags?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class FlagCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter type;

    private StringFilter flag;

    private StringFilter name;

    private LongFilter alterationId;

    private LongFilter articleId;

    private LongFilter drugId;

    private LongFilter geneId;

    private LongFilter transcriptId;

    private Boolean distinct;

    public FlagCriteria() {}

    public FlagCriteria(FlagCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.flag = other.flag == null ? null : other.flag.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.alterationId = other.alterationId == null ? null : other.alterationId.copy();
        this.articleId = other.articleId == null ? null : other.articleId.copy();
        this.drugId = other.drugId == null ? null : other.drugId.copy();
        this.geneId = other.geneId == null ? null : other.geneId.copy();
        this.transcriptId = other.transcriptId == null ? null : other.transcriptId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public FlagCriteria copy() {
        return new FlagCriteria(this);
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

    public StringFilter getFlag() {
        return flag;
    }

    public StringFilter flag() {
        if (flag == null) {
            flag = new StringFilter();
        }
        return flag;
    }

    public void setFlag(StringFilter flag) {
        this.flag = flag;
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

    public LongFilter getAlterationId() {
        return alterationId;
    }

    public LongFilter alterationId() {
        if (alterationId == null) {
            alterationId = new LongFilter();
        }
        return alterationId;
    }

    public void setAlterationId(LongFilter alterationId) {
        this.alterationId = alterationId;
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

    public LongFilter getDrugId() {
        return drugId;
    }

    public LongFilter drugId() {
        if (drugId == null) {
            drugId = new LongFilter();
        }
        return drugId;
    }

    public void setDrugId(LongFilter drugId) {
        this.drugId = drugId;
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

    public LongFilter getTranscriptId() {
        return transcriptId;
    }

    public LongFilter transcriptId() {
        if (transcriptId == null) {
            transcriptId = new LongFilter();
        }
        return transcriptId;
    }

    public void setTranscriptId(LongFilter transcriptId) {
        this.transcriptId = transcriptId;
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
        final FlagCriteria that = (FlagCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(type, that.type) &&
            Objects.equals(flag, that.flag) &&
            Objects.equals(name, that.name) &&
            Objects.equals(alterationId, that.alterationId) &&
            Objects.equals(articleId, that.articleId) &&
            Objects.equals(drugId, that.drugId) &&
            Objects.equals(geneId, that.geneId) &&
            Objects.equals(transcriptId, that.transcriptId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, type, flag, name, alterationId, articleId, drugId, geneId, transcriptId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FlagCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (flag != null ? "flag=" + flag + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (alterationId != null ? "alterationId=" + alterationId + ", " : "") +
            (articleId != null ? "articleId=" + articleId + ", " : "") +
            (drugId != null ? "drugId=" + drugId + ", " : "") +
            (geneId != null ? "geneId=" + geneId + ", " : "") +
            (transcriptId != null ? "transcriptId=" + transcriptId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
