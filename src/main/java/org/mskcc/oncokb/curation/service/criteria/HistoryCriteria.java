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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.History} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.HistoryResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /histories?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class HistoryCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter type;

    private InstantFilter updatedTime;

    private StringFilter updatedBy;

    private StringFilter entityName;

    private IntegerFilter entityId;

    private Boolean distinct;

    public HistoryCriteria() {}

    public HistoryCriteria(HistoryCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.updatedTime = other.updatedTime == null ? null : other.updatedTime.copy();
        this.updatedBy = other.updatedBy == null ? null : other.updatedBy.copy();
        this.entityName = other.entityName == null ? null : other.entityName.copy();
        this.entityId = other.entityId == null ? null : other.entityId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public HistoryCriteria copy() {
        return new HistoryCriteria(this);
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

    public StringFilter getType() {
        return type;
    }

    public StringFilter type() {
        if (type == null) {
            type = new StringFilter();
        }
        return type;
    }

    public void setType(StringFilter type) {
        this.type = type;
    }

    public InstantFilter getUpdatedTime() {
        return updatedTime;
    }

    public InstantFilter updatedTime() {
        if (updatedTime == null) {
            updatedTime = new InstantFilter();
        }
        return updatedTime;
    }

    public void setUpdatedTime(InstantFilter updatedTime) {
        this.updatedTime = updatedTime;
    }

    public StringFilter getUpdatedBy() {
        return updatedBy;
    }

    public StringFilter updatedBy() {
        if (updatedBy == null) {
            updatedBy = new StringFilter();
        }
        return updatedBy;
    }

    public void setUpdatedBy(StringFilter updatedBy) {
        this.updatedBy = updatedBy;
    }

    public StringFilter getEntityName() {
        return entityName;
    }

    public StringFilter entityName() {
        if (entityName == null) {
            entityName = new StringFilter();
        }
        return entityName;
    }

    public void setEntityName(StringFilter entityName) {
        this.entityName = entityName;
    }

    public IntegerFilter getEntityId() {
        return entityId;
    }

    public IntegerFilter entityId() {
        if (entityId == null) {
            entityId = new IntegerFilter();
        }
        return entityId;
    }

    public void setEntityId(IntegerFilter entityId) {
        this.entityId = entityId;
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
        final HistoryCriteria that = (HistoryCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(type, that.type) &&
            Objects.equals(updatedTime, that.updatedTime) &&
            Objects.equals(updatedBy, that.updatedBy) &&
            Objects.equals(entityName, that.entityName) &&
            Objects.equals(entityId, that.entityId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, type, updatedTime, updatedBy, entityName, entityId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HistoryCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (updatedTime != null ? "updatedTime=" + updatedTime + ", " : "") +
            (updatedBy != null ? "updatedBy=" + updatedBy + ", " : "") +
            (entityName != null ? "entityName=" + entityName + ", " : "") +
            (entityId != null ? "entityId=" + entityId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
