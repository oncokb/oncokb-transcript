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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.ClinicalTrial} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.ClinicalTrialResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /clinical-trials?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class ClinicalTrialCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter nctId;

    private StringFilter briefTitle;

    private StringFilter phase;

    private StringFilter status;

    private LongFilter clinicalTrialArmId;

    private LongFilter eligibilityCriteriaId;

    private LongFilter associationId;

    private Boolean distinct;

    public ClinicalTrialCriteria() {}

    public ClinicalTrialCriteria(ClinicalTrialCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.nctId = other.nctId == null ? null : other.nctId.copy();
        this.briefTitle = other.briefTitle == null ? null : other.briefTitle.copy();
        this.phase = other.phase == null ? null : other.phase.copy();
        this.status = other.status == null ? null : other.status.copy();
        this.clinicalTrialArmId = other.clinicalTrialArmId == null ? null : other.clinicalTrialArmId.copy();
        this.eligibilityCriteriaId = other.eligibilityCriteriaId == null ? null : other.eligibilityCriteriaId.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ClinicalTrialCriteria copy() {
        return new ClinicalTrialCriteria(this);
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

    public StringFilter getNctId() {
        return nctId;
    }

    public StringFilter nctId() {
        if (nctId == null) {
            nctId = new StringFilter();
        }
        return nctId;
    }

    public void setNctId(StringFilter nctId) {
        this.nctId = nctId;
    }

    public StringFilter getBriefTitle() {
        return briefTitle;
    }

    public StringFilter briefTitle() {
        if (briefTitle == null) {
            briefTitle = new StringFilter();
        }
        return briefTitle;
    }

    public void setBriefTitle(StringFilter briefTitle) {
        this.briefTitle = briefTitle;
    }

    public StringFilter getPhase() {
        return phase;
    }

    public StringFilter phase() {
        if (phase == null) {
            phase = new StringFilter();
        }
        return phase;
    }

    public void setPhase(StringFilter phase) {
        this.phase = phase;
    }

    public StringFilter getStatus() {
        return status;
    }

    public StringFilter status() {
        if (status == null) {
            status = new StringFilter();
        }
        return status;
    }

    public void setStatus(StringFilter status) {
        this.status = status;
    }

    public LongFilter getClinicalTrialArmId() {
        return clinicalTrialArmId;
    }

    public LongFilter clinicalTrialArmId() {
        if (clinicalTrialArmId == null) {
            clinicalTrialArmId = new LongFilter();
        }
        return clinicalTrialArmId;
    }

    public void setClinicalTrialArmId(LongFilter clinicalTrialArmId) {
        this.clinicalTrialArmId = clinicalTrialArmId;
    }

    public LongFilter getEligibilityCriteriaId() {
        return eligibilityCriteriaId;
    }

    public LongFilter eligibilityCriteriaId() {
        if (eligibilityCriteriaId == null) {
            eligibilityCriteriaId = new LongFilter();
        }
        return eligibilityCriteriaId;
    }

    public void setEligibilityCriteriaId(LongFilter eligibilityCriteriaId) {
        this.eligibilityCriteriaId = eligibilityCriteriaId;
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
        final ClinicalTrialCriteria that = (ClinicalTrialCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(nctId, that.nctId) &&
            Objects.equals(briefTitle, that.briefTitle) &&
            Objects.equals(phase, that.phase) &&
            Objects.equals(status, that.status) &&
            Objects.equals(clinicalTrialArmId, that.clinicalTrialArmId) &&
            Objects.equals(eligibilityCriteriaId, that.eligibilityCriteriaId) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nctId, briefTitle, phase, status, clinicalTrialArmId, eligibilityCriteriaId, associationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrialCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (nctId != null ? "nctId=" + nctId + ", " : "") +
            (briefTitle != null ? "briefTitle=" + briefTitle + ", " : "") +
            (phase != null ? "phase=" + phase + ", " : "") +
            (status != null ? "status=" + status + ", " : "") +
            (clinicalTrialArmId != null ? "clinicalTrialArmId=" + clinicalTrialArmId + ", " : "") +
            (eligibilityCriteriaId != null ? "eligibilityCriteriaId=" + eligibilityCriteriaId + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
