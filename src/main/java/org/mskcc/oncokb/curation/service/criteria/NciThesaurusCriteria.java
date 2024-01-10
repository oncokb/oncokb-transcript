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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.NciThesaurus} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.NciThesaurusResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /nci-thesauruses?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class NciThesaurusCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter version;

    private StringFilter code;

    private StringFilter preferredName;

    private StringFilter displayName;

    private LongFilter synonymId;

    private Boolean distinct;

    public NciThesaurusCriteria() {}

    public NciThesaurusCriteria(NciThesaurusCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.version = other.version == null ? null : other.version.copy();
        this.code = other.code == null ? null : other.code.copy();
        this.preferredName = other.preferredName == null ? null : other.preferredName.copy();
        this.displayName = other.displayName == null ? null : other.displayName.copy();
        this.synonymId = other.synonymId == null ? null : other.synonymId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public NciThesaurusCriteria copy() {
        return new NciThesaurusCriteria(this);
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

    public StringFilter getVersion() {
        return version;
    }

    public StringFilter version() {
        if (version == null) {
            version = new StringFilter();
        }
        return version;
    }

    public void setVersion(StringFilter version) {
        this.version = version;
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

    public StringFilter getPreferredName() {
        return preferredName;
    }

    public StringFilter preferredName() {
        if (preferredName == null) {
            preferredName = new StringFilter();
        }
        return preferredName;
    }

    public void setPreferredName(StringFilter preferredName) {
        this.preferredName = preferredName;
    }

    public StringFilter getDisplayName() {
        return displayName;
    }

    public StringFilter displayName() {
        if (displayName == null) {
            displayName = new StringFilter();
        }
        return displayName;
    }

    public void setDisplayName(StringFilter displayName) {
        this.displayName = displayName;
    }

    public LongFilter getSynonymId() {
        return synonymId;
    }

    public LongFilter synonymId() {
        if (synonymId == null) {
            synonymId = new LongFilter();
        }
        return synonymId;
    }

    public void setSynonymId(LongFilter synonymId) {
        this.synonymId = synonymId;
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
        final NciThesaurusCriteria that = (NciThesaurusCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(version, that.version) &&
            Objects.equals(code, that.code) &&
            Objects.equals(preferredName, that.preferredName) &&
            Objects.equals(displayName, that.displayName) &&
            Objects.equals(synonymId, that.synonymId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, version, code, preferredName, displayName, synonymId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NciThesaurusCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (version != null ? "version=" + version + ", " : "") +
            (code != null ? "code=" + code + ", " : "") +
            (preferredName != null ? "preferredName=" + preferredName + ", " : "") +
            (displayName != null ? "displayName=" + displayName + ", " : "") +
            (synonymId != null ? "synonymId=" + synonymId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
