package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.CancerType} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.CancerTypeResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /cancer-types?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class CancerTypeCriteria implements Serializable, Criteria {

    /**
     * Class for filtering TumorForm
     */
    public static class TumorFormFilter extends Filter<TumorForm> {

        public TumorFormFilter() {}

        public TumorFormFilter(TumorFormFilter filter) {
            super(filter);
        }

        @Override
        public TumorFormFilter copy() {
            return new TumorFormFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter code;

    private StringFilter color;

    private IntegerFilter level;

    private StringFilter mainType;

    private StringFilter subtype;

    private StringFilter tissue;

    private TumorFormFilter tumorForm;

    private LongFilter childrenId;

    private LongFilter biomarkerAssociationId;

    private LongFilter parentId;

    private Boolean distinct;

    public CancerTypeCriteria() {}

    public CancerTypeCriteria(CancerTypeCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.code = other.code == null ? null : other.code.copy();
        this.color = other.color == null ? null : other.color.copy();
        this.level = other.level == null ? null : other.level.copy();
        this.mainType = other.mainType == null ? null : other.mainType.copy();
        this.subtype = other.subtype == null ? null : other.subtype.copy();
        this.tissue = other.tissue == null ? null : other.tissue.copy();
        this.tumorForm = other.tumorForm == null ? null : other.tumorForm.copy();
        this.childrenId = other.childrenId == null ? null : other.childrenId.copy();
        this.biomarkerAssociationId = other.biomarkerAssociationId == null ? null : other.biomarkerAssociationId.copy();
        this.parentId = other.parentId == null ? null : other.parentId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public CancerTypeCriteria copy() {
        return new CancerTypeCriteria(this);
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

    public StringFilter getCode() {
        return code;
    }

    public StringFilter code() {
        if (code == null) {
            code = new StringFilter();
        }
        return code;
    }

    public void setCode(StringFilter code) {
        this.code = code;
    }

    public StringFilter getColor() {
        return color;
    }

    public StringFilter color() {
        if (color == null) {
            color = new StringFilter();
        }
        return color;
    }

    public void setColor(StringFilter color) {
        this.color = color;
    }

    public IntegerFilter getLevel() {
        return level;
    }

    public IntegerFilter level() {
        if (level == null) {
            level = new IntegerFilter();
        }
        return level;
    }

    public void setLevel(IntegerFilter level) {
        this.level = level;
    }

    public StringFilter getMainType() {
        return mainType;
    }

    public StringFilter mainType() {
        if (mainType == null) {
            mainType = new StringFilter();
        }
        return mainType;
    }

    public void setMainType(StringFilter mainType) {
        this.mainType = mainType;
    }

    public StringFilter getSubtype() {
        return subtype;
    }

    public StringFilter subtype() {
        if (subtype == null) {
            subtype = new StringFilter();
        }
        return subtype;
    }

    public void setSubtype(StringFilter subtype) {
        this.subtype = subtype;
    }

    public StringFilter getTissue() {
        return tissue;
    }

    public StringFilter tissue() {
        if (tissue == null) {
            tissue = new StringFilter();
        }
        return tissue;
    }

    public void setTissue(StringFilter tissue) {
        this.tissue = tissue;
    }

    public TumorFormFilter getTumorForm() {
        return tumorForm;
    }

    public TumorFormFilter tumorForm() {
        if (tumorForm == null) {
            tumorForm = new TumorFormFilter();
        }
        return tumorForm;
    }

    public void setTumorForm(TumorFormFilter tumorForm) {
        this.tumorForm = tumorForm;
    }

    public LongFilter getChildrenId() {
        return childrenId;
    }

    public LongFilter childrenId() {
        if (childrenId == null) {
            childrenId = new LongFilter();
        }
        return childrenId;
    }

    public void setChildrenId(LongFilter childrenId) {
        this.childrenId = childrenId;
    }

    public LongFilter getBiomarkerAssociationId() {
        return biomarkerAssociationId;
    }

    public LongFilter biomarkerAssociationId() {
        if (biomarkerAssociationId == null) {
            biomarkerAssociationId = new LongFilter();
        }
        return biomarkerAssociationId;
    }

    public void setBiomarkerAssociationId(LongFilter biomarkerAssociationId) {
        this.biomarkerAssociationId = biomarkerAssociationId;
    }

    public LongFilter getParentId() {
        return parentId;
    }

    public LongFilter parentId() {
        if (parentId == null) {
            parentId = new LongFilter();
        }
        return parentId;
    }

    public void setParentId(LongFilter parentId) {
        this.parentId = parentId;
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
        final CancerTypeCriteria that = (CancerTypeCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(code, that.code) &&
            Objects.equals(color, that.color) &&
            Objects.equals(level, that.level) &&
            Objects.equals(mainType, that.mainType) &&
            Objects.equals(subtype, that.subtype) &&
            Objects.equals(tissue, that.tissue) &&
            Objects.equals(tumorForm, that.tumorForm) &&
            Objects.equals(childrenId, that.childrenId) &&
            Objects.equals(biomarkerAssociationId, that.biomarkerAssociationId) &&
            Objects.equals(parentId, that.parentId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            code,
            color,
            level,
            mainType,
            subtype,
            tissue,
            tumorForm,
            childrenId,
            biomarkerAssociationId,
            parentId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CancerTypeCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (code != null ? "code=" + code + ", " : "") +
            (color != null ? "color=" + color + ", " : "") +
            (level != null ? "level=" + level + ", " : "") +
            (mainType != null ? "mainType=" + mainType + ", " : "") +
            (subtype != null ? "subtype=" + subtype + ", " : "") +
            (tissue != null ? "tissue=" + tissue + ", " : "") +
            (tumorForm != null ? "tumorForm=" + tumorForm + ", " : "") +
            (childrenId != null ? "childrenId=" + childrenId + ", " : "") +
            (biomarkerAssociationId != null ? "biomarkerAssociationId=" + biomarkerAssociationId + ", " : "") +
            (parentId != null ? "parentId=" + parentId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
