package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.EligibilityCriteriaType;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.EligibilityCriteria} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.EligibilityCriteriaResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /eligibility-criteria?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class EligibilityCriteriaCriteria implements Serializable, Criteria {

    /**
     * Class for filtering EligibilityCriteriaType
     */
    public static class EligibilityCriteriaTypeFilter extends Filter<EligibilityCriteriaType> {

        public EligibilityCriteriaTypeFilter() {}

        public EligibilityCriteriaTypeFilter(EligibilityCriteriaTypeFilter filter) {
            super(filter);
        }

        @Override
        public EligibilityCriteriaTypeFilter copy() {
            return new EligibilityCriteriaTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private EligibilityCriteriaTypeFilter type;

    private IntegerFilter priority;

    private LongFilter associationId;

    private LongFilter clinicalTrialId;

    private Boolean distinct;

    public EligibilityCriteriaCriteria() {}

    public EligibilityCriteriaCriteria(EligibilityCriteriaCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.priority = other.priority == null ? null : other.priority.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.clinicalTrialId = other.clinicalTrialId == null ? null : other.clinicalTrialId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public EligibilityCriteriaCriteria copy() {
        return new EligibilityCriteriaCriteria(this);
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

    public EligibilityCriteriaTypeFilter getType() {
        return type;
    }

    public EligibilityCriteriaTypeFilter type() {
        if (type == null) {
            type = new EligibilityCriteriaTypeFilter();
        }
        return type;
    }

    public void setType(EligibilityCriteriaTypeFilter type) {
        this.type = type;
    }

    public IntegerFilter getPriority() {
        return priority;
    }

    public IntegerFilter priority() {
        if (priority == null) {
            priority = new IntegerFilter();
        }
        return priority;
    }

    public void setPriority(IntegerFilter priority) {
        this.priority = priority;
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

    public LongFilter getClinicalTrialId() {
        return clinicalTrialId;
    }

    public LongFilter clinicalTrialId() {
        if (clinicalTrialId == null) {
            clinicalTrialId = new LongFilter();
        }
        return clinicalTrialId;
    }

    public void setClinicalTrialId(LongFilter clinicalTrialId) {
        this.clinicalTrialId = clinicalTrialId;
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
        final EligibilityCriteriaCriteria that = (EligibilityCriteriaCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(type, that.type) &&
            Objects.equals(priority, that.priority) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(clinicalTrialId, that.clinicalTrialId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, type, priority, associationId, clinicalTrialId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EligibilityCriteriaCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (priority != null ? "priority=" + priority + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (clinicalTrialId != null ? "clinicalTrialId=" + clinicalTrialId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
