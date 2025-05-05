package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.LocalDateFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.FdaSubmission} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.FdaSubmissionResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /fda-submissions?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class FdaSubmissionCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter number;

    private StringFilter supplementNumber;

    private StringFilter deviceName;

    private StringFilter genericName;

    private LocalDateFilter dateReceived;

    private LocalDateFilter decisionDate;

    private BooleanFilter curated;

    private BooleanFilter genetic;

    private LongFilter articleId;

    private LongFilter associationId;

    private LongFilter companionDiagnosticDeviceId;

    private LongFilter fdaDrugId;

    private LongFilter typeId;

    private Boolean distinct;

    public FdaSubmissionCriteria() {}

    public FdaSubmissionCriteria(FdaSubmissionCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.number = other.number == null ? null : other.number.copy();
        this.supplementNumber = other.supplementNumber == null ? null : other.supplementNumber.copy();
        this.deviceName = other.deviceName == null ? null : other.deviceName.copy();
        this.genericName = other.genericName == null ? null : other.genericName.copy();
        this.dateReceived = other.dateReceived == null ? null : other.dateReceived.copy();
        this.decisionDate = other.decisionDate == null ? null : other.decisionDate.copy();
        this.curated = other.curated == null ? null : other.curated.copy();
        this.genetic = other.genetic == null ? null : other.genetic.copy();
        this.articleId = other.articleId == null ? null : other.articleId.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.companionDiagnosticDeviceId = other.companionDiagnosticDeviceId == null ? null : other.companionDiagnosticDeviceId.copy();
        this.fdaDrugId = other.fdaDrugId == null ? null : other.fdaDrugId.copy();
        this.typeId = other.typeId == null ? null : other.typeId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public FdaSubmissionCriteria copy() {
        return new FdaSubmissionCriteria(this);
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

    public StringFilter getNumber() {
        return number;
    }

    public StringFilter number() {
        if (number == null) {
            number = new StringFilter();
        }
        return number;
    }

    public void setNumber(StringFilter number) {
        this.number = number;
    }

    public StringFilter getSupplementNumber() {
        return supplementNumber;
    }

    public StringFilter supplementNumber() {
        if (supplementNumber == null) {
            supplementNumber = new StringFilter();
        }
        return supplementNumber;
    }

    public void setSupplementNumber(StringFilter supplementNumber) {
        this.supplementNumber = supplementNumber;
    }

    public StringFilter getDeviceName() {
        return deviceName;
    }

    public StringFilter deviceName() {
        if (deviceName == null) {
            deviceName = new StringFilter();
        }
        return deviceName;
    }

    public void setDeviceName(StringFilter deviceName) {
        this.deviceName = deviceName;
    }

    public StringFilter getGenericName() {
        return genericName;
    }

    public StringFilter genericName() {
        if (genericName == null) {
            genericName = new StringFilter();
        }
        return genericName;
    }

    public void setGenericName(StringFilter genericName) {
        this.genericName = genericName;
    }

    public LocalDateFilter getDateReceived() {
        return dateReceived;
    }

    public LocalDateFilter dateReceived() {
        if (dateReceived == null) {
            dateReceived = new LocalDateFilter();
        }
        return dateReceived;
    }

    public void setDateReceived(LocalDateFilter dateReceived) {
        this.dateReceived = dateReceived;
    }

    public LocalDateFilter getDecisionDate() {
        return decisionDate;
    }

    public LocalDateFilter decisionDate() {
        if (decisionDate == null) {
            decisionDate = new LocalDateFilter();
        }
        return decisionDate;
    }

    public void setDecisionDate(LocalDateFilter decisionDate) {
        this.decisionDate = decisionDate;
    }

    public BooleanFilter getCurated() {
        return curated;
    }

    public BooleanFilter curated() {
        if (curated == null) {
            curated = new BooleanFilter();
        }
        return curated;
    }

    public void setCurated(BooleanFilter curated) {
        this.curated = curated;
    }

    public BooleanFilter getGenetic() {
        return genetic;
    }

    public BooleanFilter genetic() {
        if (genetic == null) {
            genetic = new BooleanFilter();
        }
        return genetic;
    }

    public void setGenetic(BooleanFilter genetic) {
        this.genetic = genetic;
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

    public LongFilter getCompanionDiagnosticDeviceId() {
        return companionDiagnosticDeviceId;
    }

    public LongFilter companionDiagnosticDeviceId() {
        if (companionDiagnosticDeviceId == null) {
            companionDiagnosticDeviceId = new LongFilter();
        }
        return companionDiagnosticDeviceId;
    }

    public void setCompanionDiagnosticDeviceId(LongFilter companionDiagnosticDeviceId) {
        this.companionDiagnosticDeviceId = companionDiagnosticDeviceId;
    }

    public LongFilter getFdaDrugId() {
        return fdaDrugId;
    }

    public LongFilter fdaDrugId() {
        if (fdaDrugId == null) {
            fdaDrugId = new LongFilter();
        }
        return fdaDrugId;
    }

    public void setFdaDrugId(LongFilter fdaDrugId) {
        this.fdaDrugId = fdaDrugId;
    }

    public LongFilter getTypeId() {
        return typeId;
    }

    public LongFilter typeId() {
        if (typeId == null) {
            typeId = new LongFilter();
        }
        return typeId;
    }

    public void setTypeId(LongFilter typeId) {
        this.typeId = typeId;
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
        final FdaSubmissionCriteria that = (FdaSubmissionCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(number, that.number) &&
            Objects.equals(supplementNumber, that.supplementNumber) &&
            Objects.equals(deviceName, that.deviceName) &&
            Objects.equals(genericName, that.genericName) &&
            Objects.equals(dateReceived, that.dateReceived) &&
            Objects.equals(decisionDate, that.decisionDate) &&
            Objects.equals(curated, that.curated) &&
            Objects.equals(genetic, that.genetic) &&
            Objects.equals(articleId, that.articleId) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(companionDiagnosticDeviceId, that.companionDiagnosticDeviceId) &&
            Objects.equals(fdaDrugId, that.fdaDrugId) &&
            Objects.equals(typeId, that.typeId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            number,
            supplementNumber,
            deviceName,
            genericName,
            dateReceived,
            decisionDate,
            curated,
            genetic,
            articleId,
            associationId,
            companionDiagnosticDeviceId,
            fdaDrugId,
            typeId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FdaSubmissionCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (number != null ? "number=" + number + ", " : "") +
            (supplementNumber != null ? "supplementNumber=" + supplementNumber + ", " : "") +
            (deviceName != null ? "deviceName=" + deviceName + ", " : "") +
            (genericName != null ? "genericName=" + genericName + ", " : "") +
            (dateReceived != null ? "dateReceived=" + dateReceived + ", " : "") +
            (decisionDate != null ? "decisionDate=" + decisionDate + ", " : "") +
            (curated != null ? "curated=" + curated + ", " : "") +
            (genetic != null ? "genetic=" + genetic + ", " : "") +
            (articleId != null ? "articleId=" + articleId + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (companionDiagnosticDeviceId != null ? "companionDiagnosticDeviceId=" + companionDiagnosticDeviceId + ", " : "") +
            (fdaDrugId != null ? "fdaDrugId=" + fdaDrugId + ", " : "") +
            (typeId != null ? "typeId=" + typeId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
