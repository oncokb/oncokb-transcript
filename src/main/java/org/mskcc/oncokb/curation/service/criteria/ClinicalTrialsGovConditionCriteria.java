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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.ClinicalTrialsGovConditionResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /clinical-trials-gov-conditions?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class ClinicalTrialsGovConditionCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter name;

    private LongFilter cancerTypeId;

    private Boolean distinct;

    public ClinicalTrialsGovConditionCriteria() {}

    public ClinicalTrialsGovConditionCriteria(ClinicalTrialsGovConditionCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.cancerTypeId = other.cancerTypeId == null ? null : other.cancerTypeId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ClinicalTrialsGovConditionCriteria copy() {
        return new ClinicalTrialsGovConditionCriteria(this);
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

    public LongFilter getCancerTypeId() {
        return cancerTypeId;
    }

    public LongFilter cancerTypeId() {
        if (cancerTypeId == null) {
            cancerTypeId = new LongFilter();
        }
        return cancerTypeId;
    }

    public void setCancerTypeId(LongFilter cancerTypeId) {
        this.cancerTypeId = cancerTypeId;
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
        final ClinicalTrialsGovConditionCriteria that = (ClinicalTrialsGovConditionCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(cancerTypeId, that.cancerTypeId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, cancerTypeId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClinicalTrialsGovConditionCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (cancerTypeId != null ? "cancerTypeId=" + cancerTypeId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
