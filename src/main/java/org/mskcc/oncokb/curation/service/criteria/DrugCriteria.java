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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Drug} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.DrugResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /drugs?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class DrugCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter uuid;

    private StringFilter name;

    private StringFilter ncitCode;

    private LongFilter flagId;

    private LongFilter fdaDrugId;

    private LongFilter treatmentId;

    private Boolean distinct;

    public DrugCriteria() {}

    public DrugCriteria(DrugCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.uuid = other.uuid == null ? null : other.uuid.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.ncitCode = other.ncitCode == null ? null : other.ncitCode.copy();
        this.flagId = other.flagId == null ? null : other.flagId.copy();
        this.fdaDrugId = other.fdaDrugId == null ? null : other.fdaDrugId.copy();
        this.treatmentId = other.treatmentId == null ? null : other.treatmentId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public DrugCriteria copy() {
        return new DrugCriteria(this);
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

    public StringFilter getUuid() {
        return uuid;
    }

    public void setUuid(StringFilter uuid) {
        this.uuid = uuid;
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

    public StringFilter getNcitCode() {
        return ncitCode;
    }

    public StringFilter ncitCode() {
        if (ncitCode == null) {
            ncitCode = new StringFilter();
        }
        return ncitCode;
    }

    public void setNcitCode(StringFilter ncitCode) {
        this.ncitCode = ncitCode;
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

    public LongFilter getTreatmentId() {
        return treatmentId;
    }

    public LongFilter treatmentId() {
        if (treatmentId == null) {
            treatmentId = new LongFilter();
        }
        return treatmentId;
    }

    public void setTreatmentId(LongFilter treatmentId) {
        this.treatmentId = treatmentId;
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
        final DrugCriteria that = (DrugCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(uuid, that.uuid) &&
            Objects.equals(name, that.name) &&
            Objects.equals(ncitCode, that.ncitCode) &&
            Objects.equals(flagId, that.flagId) &&
            Objects.equals(fdaDrugId, that.fdaDrugId) &&
            Objects.equals(treatmentId, that.treatmentId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, ncitCode, flagId, fdaDrugId, treatmentId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DrugCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (uuid != null ? "uuid=" + uuid + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (ncitCode != null ? "ncitCode=" + ncitCode + ", " : "") +
            (flagId != null ? "flagId=" + flagId + ", " : "") +
            (fdaDrugId != null ? "fdaDrugId=" + fdaDrugId + ", " : "") +
            (treatmentId != null ? "treatmentId=" + treatmentId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
