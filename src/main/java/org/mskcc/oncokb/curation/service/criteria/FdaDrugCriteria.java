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

    private StringFilter sponsorName;

    private StringFilter overallMarketingStatus;

    private LongFilter fdaSubmissionId;

    private LongFilter drugId;

    private Boolean distinct;

    public FdaDrugCriteria() {}

    public FdaDrugCriteria(FdaDrugCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.applicationNumber = other.applicationNumber == null ? null : other.applicationNumber.copy();
        this.sponsorName = other.sponsorName == null ? null : other.sponsorName.copy();
        this.overallMarketingStatus = other.overallMarketingStatus == null ? null : other.overallMarketingStatus.copy();
        this.fdaSubmissionId = other.fdaSubmissionId == null ? null : other.fdaSubmissionId.copy();
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

    public StringFilter getSponsorName() {
        return sponsorName;
    }

    public StringFilter sponsorName() {
        if (sponsorName == null) {
            sponsorName = new StringFilter();
        }
        return sponsorName;
    }

    public void setSponsorName(StringFilter sponsorName) {
        this.sponsorName = sponsorName;
    }

    public StringFilter getOverallMarketingStatus() {
        return overallMarketingStatus;
    }

    public StringFilter overallMarketingStatus() {
        if (overallMarketingStatus == null) {
            overallMarketingStatus = new StringFilter();
        }
        return overallMarketingStatus;
    }

    public void setOverallMarketingStatus(StringFilter overallMarketingStatus) {
        this.overallMarketingStatus = overallMarketingStatus;
    }

    public LongFilter getFdaSubmissionId() {
        return fdaSubmissionId;
    }

    public LongFilter fdaSubmissionId() {
        if (fdaSubmissionId == null) {
            fdaSubmissionId = new LongFilter();
        }
        return fdaSubmissionId;
    }

    public void setFdaSubmissionId(LongFilter fdaSubmissionId) {
        this.fdaSubmissionId = fdaSubmissionId;
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
            Objects.equals(sponsorName, that.sponsorName) &&
            Objects.equals(overallMarketingStatus, that.overallMarketingStatus) &&
            Objects.equals(fdaSubmissionId, that.fdaSubmissionId) &&
            Objects.equals(drugId, that.drugId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, applicationNumber, sponsorName, overallMarketingStatus, fdaSubmissionId, drugId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaDrugCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (applicationNumber != null ? "applicationNumber=" + applicationNumber + ", " : "") +
            (sponsorName != null ? "sponsorName=" + sponsorName + ", " : "") +
            (overallMarketingStatus != null ? "overallMarketingStatus=" + overallMarketingStatus + ", " : "") +
            (fdaSubmissionId != null ? "fdaSubmissionId=" + fdaSubmissionId + ", " : "") +
            (drugId != null ? "drugId=" + drugId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
