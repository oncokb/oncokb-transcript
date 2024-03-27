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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Treatment} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.TreatmentResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /treatments?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class TreatmentCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter name;

    private LongFilter treatmentPriorityId;

    private LongFilter drugId;

    private LongFilter associationId;

    private Boolean distinct;

    public TreatmentCriteria() {}

    public TreatmentCriteria(TreatmentCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.treatmentPriorityId = other.treatmentPriorityId == null ? null : other.treatmentPriorityId.copy();
        this.drugId = other.drugId == null ? null : other.drugId.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public TreatmentCriteria copy() {
        return new TreatmentCriteria(this);
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

    public LongFilter getTreatmentPriorityId() {
        return treatmentPriorityId;
    }

    public LongFilter treatmentPriorityId() {
        if (treatmentPriorityId == null) {
            treatmentPriorityId = new LongFilter();
        }
        return treatmentPriorityId;
    }

    public void setTreatmentPriorityId(LongFilter treatmentPriorityId) {
        this.treatmentPriorityId = treatmentPriorityId;
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
        final TreatmentCriteria that = (TreatmentCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(treatmentPriorityId, that.treatmentPriorityId) &&
            Objects.equals(drugId, that.drugId) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, treatmentPriorityId, drugId, associationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TreatmentCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (treatmentPriorityId != null ? "treatmentPriorityId=" + treatmentPriorityId + ", " : "") +
            (drugId != null ? "drugId=" + drugId + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
