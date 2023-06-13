package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
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
 * Criteria class for the {@link com.mycompany.myapp.domain.FdaSubmission} entity. This class is used
 * in {@link com.mycompany.myapp.web.rest.FdaSubmissionResource} to receive all the possible filtering options from
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

    private InstantFilter dateReceived;

    private InstantFilter decisionDate;

    private BooleanFilter curated;

    private BooleanFilter genetic;

    private LongFilter deviceUsageIndicationId;

    private LongFilter companionDiagnosticDeviceId;

    private LongFilter typeId;

    private StringFilter typeName;

    private StringFilter typeShortName;

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
        this.deviceUsageIndicationId = other.deviceUsageIndicationId == null ? null : other.deviceUsageIndicationId.copy();
        this.companionDiagnosticDeviceId = other.companionDiagnosticDeviceId == null ? null : other.companionDiagnosticDeviceId.copy();
        this.typeId = other.typeId == null ? null : other.typeId.copy();
        this.typeName = other.typeName == null ? null : other.typeName.copy();
        this.typeShortName = other.typeShortName == null ? null : other.typeShortName.copy();
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

    public InstantFilter getDateReceived() {
        return dateReceived;
    }

    public InstantFilter dateReceived() {
        if (dateReceived == null) {
            dateReceived = new InstantFilter();
        }
        return dateReceived;
    }

    public void setDateReceived(InstantFilter dateReceived) {
        this.dateReceived = dateReceived;
    }

    public InstantFilter getDecisionDate() {
        return decisionDate;
    }

    public InstantFilter decisionDate() {
        if (decisionDate == null) {
            decisionDate = new InstantFilter();
        }
        return decisionDate;
    }

    public void setDecisionDate(InstantFilter decisionDate) {
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

    public LongFilter getDeviceUsageIndicationId() {
        return deviceUsageIndicationId;
    }

    public LongFilter deviceUsageIndicationId() {
        if (deviceUsageIndicationId == null) {
            deviceUsageIndicationId = new LongFilter();
        }
        return deviceUsageIndicationId;
    }

    public void setDeviceUsageIndicationId(LongFilter deviceUsageIndicationId) {
        this.deviceUsageIndicationId = deviceUsageIndicationId;
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

    public StringFilter getTypeName() {
        return this.typeName;
    }

    public StringFilter typeName() {
        if (typeName == null) {
            typeName = new StringFilter();
        }
        return typeName;
    }

    public void setTypeName(StringFilter typeName) {
        this.typeName = typeName;
    }

    public StringFilter getTypeShortName() {
        return this.typeShortName;
    }

    public StringFilter typeShortName() {
        if (typeShortName == null) {
            typeShortName = new StringFilter();
        }
        return typeShortName;
    }

    public void settypeShortName(StringFilter typeShortName) {
        this.typeShortName = typeShortName;
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
            Objects.equals(deviceUsageIndicationId, that.deviceUsageIndicationId) &&
            Objects.equals(companionDiagnosticDeviceId, that.companionDiagnosticDeviceId) &&
            Objects.equals(typeId, that.typeId) &&
            Objects.equals(typeName, that.typeName) &&
            Objects.equals(typeShortName, that.typeShortName) &&
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
            deviceUsageIndicationId,
            companionDiagnosticDeviceId,
            typeId,
            typeName,
            typeShortName,
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
            (deviceUsageIndicationId != null ? "deviceUsageIndicationId=" + deviceUsageIndicationId + ", " : "") +
            (companionDiagnosticDeviceId != null ? "companionDiagnosticDeviceId=" + companionDiagnosticDeviceId + ", " : "") +
            (typeId != null ? "typeId=" + typeId + ", " : "") +
            (typeName != null ? "typeName=" + typeName + ", " : "") +
            (typeShortName != null ? "typeShortName=" + typeShortName + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
