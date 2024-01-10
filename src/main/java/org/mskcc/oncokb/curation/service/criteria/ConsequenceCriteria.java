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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Consequence} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.ConsequenceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /consequences?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class ConsequenceCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter term;

    private StringFilter name;

    private BooleanFilter isGenerallyTruncating;

    private StringFilter description;

    private LongFilter alterationId;

    private LongFilter categoricalAlterationId;

    private Boolean distinct;

    public ConsequenceCriteria() {}

    public ConsequenceCriteria(ConsequenceCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.term = other.term == null ? null : other.term.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.isGenerallyTruncating = other.isGenerallyTruncating == null ? null : other.isGenerallyTruncating.copy();
        this.description = other.description == null ? null : other.description.copy();
        this.alterationId = other.alterationId == null ? null : other.alterationId.copy();
        this.categoricalAlterationId = other.categoricalAlterationId == null ? null : other.categoricalAlterationId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ConsequenceCriteria copy() {
        return new ConsequenceCriteria(this);
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

    public StringFilter getTerm() {
        return term;
    }

    public StringFilter term() {
        if (term == null) {
            term = new StringFilter();
        }
        return term;
    }

    public void setTerm(StringFilter term) {
        this.term = term;
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

    public BooleanFilter getIsGenerallyTruncating() {
        return isGenerallyTruncating;
    }

    public BooleanFilter isGenerallyTruncating() {
        if (isGenerallyTruncating == null) {
            isGenerallyTruncating = new BooleanFilter();
        }
        return isGenerallyTruncating;
    }

    public void setIsGenerallyTruncating(BooleanFilter isGenerallyTruncating) {
        this.isGenerallyTruncating = isGenerallyTruncating;
    }

    public StringFilter getDescription() {
        return description;
    }

    public StringFilter description() {
        if (description == null) {
            description = new StringFilter();
        }
        return description;
    }

    public void setDescription(StringFilter description) {
        this.description = description;
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

    public LongFilter getCategoricalAlterationId() {
        return categoricalAlterationId;
    }

    public LongFilter categoricalAlterationId() {
        if (categoricalAlterationId == null) {
            categoricalAlterationId = new LongFilter();
        }
        return categoricalAlterationId;
    }

    public void setCategoricalAlterationId(LongFilter categoricalAlterationId) {
        this.categoricalAlterationId = categoricalAlterationId;
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
        final ConsequenceCriteria that = (ConsequenceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(term, that.term) &&
            Objects.equals(name, that.name) &&
            Objects.equals(isGenerallyTruncating, that.isGenerallyTruncating) &&
            Objects.equals(description, that.description) &&
            Objects.equals(alterationId, that.alterationId) &&
            Objects.equals(categoricalAlterationId, that.categoricalAlterationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, term, name, isGenerallyTruncating, description, alterationId, categoricalAlterationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ConsequenceCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (term != null ? "term=" + term + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (isGenerallyTruncating != null ? "isGenerallyTruncating=" + isGenerallyTruncating + ", " : "") +
            (description != null ? "description=" + description + ", " : "") +
            (alterationId != null ? "alterationId=" + alterationId + ", " : "") +
            (categoricalAlterationId != null ? "categoricalAlterationId=" + categoricalAlterationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
