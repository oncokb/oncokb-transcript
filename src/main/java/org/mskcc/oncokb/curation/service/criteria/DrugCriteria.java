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

    private StringFilter name;

    private StringFilter code;

    private LongFilter fdaDrugId;

    private LongFilter synonymsId;

    private LongFilter brandsId;

    private StringFilter brandsName;
    private LongFilter biomarkerAssociationId;

    private Boolean distinct;

    public DrugCriteria() {}

    public DrugCriteria(DrugCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.code = other.code == null ? null : other.code.copy();
        this.fdaDrugId = other.fdaDrugId == null ? null : other.fdaDrugId.copy();
        this.synonymsId = other.synonymsId == null ? null : other.synonymsId.copy();
        this.brandsId = other.brandsId == null ? null : other.brandsId.copy();
        this.brandsName = other.brandsName == null ? null : other.brandsName.copy();
        this.biomarkerAssociationId = other.biomarkerAssociationId == null ? null : other.biomarkerAssociationId.copy();
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

    public LongFilter getSynonymsId() {
        return synonymsId;
    }

    public LongFilter synonymsId() {
        if (synonymsId == null) {
            synonymsId = new LongFilter();
        }
        return synonymsId;
    }

    public void setSynonymsId(LongFilter synonymsId) {
        this.synonymsId = synonymsId;
    }

    public LongFilter getBrandsId() {
        return brandsId;
    }

    public LongFilter brandsId() {
        if (brandsId == null) {
            brandsId = new LongFilter();
        }
        return brandsId;
    }

    public void setBrandsId(LongFilter brandsId) {
        this.brandsId = brandsId;
    }

    public StringFilter getBrandsName() {
        return brandsName;
    }

    public StringFilter brandsName() {
        if (brandsName == null) {
            brandsName = new StringFilter();
        }
        return brandsName;
    }

    public void setBrandsName(StringFilter brandsName) {
        this.brandsName = brandsName;
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
            Objects.equals(code, that.code) &&
            Objects.equals(name, that.name) &&
            Objects.equals(fdaDrugId, that.fdaDrugId) &&
            Objects.equals(synonymsId, that.synonymsId) &&
            Objects.equals(brandsId, that.brandsId) &&
            Objects.equals(brandsName, that.brandsName) &&
            Objects.equals(biomarkerAssociationId, that.biomarkerAssociationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, code, fdaDrugId, synonymsId, brandsId, brandsName, biomarkerAssociationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DrugCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (code != null ? "code=" + code + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (fdaDrugId != null ? "fdaDrugId=" + fdaDrugId + ", " : "") +
            (synonymsId != null ? "synonymsId=" + synonymsId + ", " : "") +
            (brandsId != null ? "brandsId=" + brandsId + ", " : "") +
            (brandsName != null ? "brandsName=" + brandsName + ", " : "") +
            (biomarkerAssociationId != null ? "biomarkerAssociationId=" + biomarkerAssociationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
