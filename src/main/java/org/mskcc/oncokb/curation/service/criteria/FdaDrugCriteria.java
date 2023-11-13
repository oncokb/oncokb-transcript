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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.FdaDrug} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.FdaDrugResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /fda-drugs?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class FdaDrugCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter applicationNumber;

    private LongFilter drugId;

    private Boolean distinct;

    public FdaDrugCriteria() {}

    public FdaDrugCriteria(FdaDrugCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.applicationNumber = other.applicationNumber == null ? null : other.applicationNumber.copy();
        this.drugId = other.drugId == null ? null : other.drugId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public FdaDrugCriteria copy() {
        return new FdaDrugCriteria(this);
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

    public StringFilter getApplicationNumber() {
        return applicationNumber;
    }

    public StringFilter applicationNumber() {
        if (applicationNumber == null) {
            applicationNumber = new StringFilter();
        }
        return applicationNumber;
    }

    public void setApplicationNumber(StringFilter applicationNumber) {
        this.applicationNumber = applicationNumber;
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
        final FdaDrugCriteria that = (FdaDrugCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(applicationNumber, that.applicationNumber) &&
            Objects.equals(drugId, that.drugId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, applicationNumber, drugId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaDrugCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (applicationNumber != null ? "applicationNumber=" + applicationNumber + ", " : "") +
            (drugId != null ? "drugId=" + drugId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
