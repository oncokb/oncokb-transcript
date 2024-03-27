package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Sequence} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.SequenceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /sequences?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class SequenceCriteria implements Serializable, Criteria {

    /**
     * Class for filtering SequenceType
     */
    public static class SequenceTypeFilter extends Filter<SequenceType> {

        public SequenceTypeFilter() {}

        public SequenceTypeFilter(SequenceTypeFilter filter) {
            super(filter);
        }

        @Override
        public SequenceTypeFilter copy() {
            return new SequenceTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private SequenceTypeFilter sequenceType;

    private LongFilter transcriptId;

    private Boolean distinct;

    public SequenceCriteria() {}

    public SequenceCriteria(SequenceCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.sequenceType = other.sequenceType == null ? null : other.sequenceType.copy();
        this.transcriptId = other.transcriptId == null ? null : other.transcriptId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public SequenceCriteria copy() {
        return new SequenceCriteria(this);
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

    public SequenceTypeFilter getSequenceType() {
        return sequenceType;
    }

    public SequenceTypeFilter sequenceType() {
        if (sequenceType == null) {
            sequenceType = new SequenceTypeFilter();
        }
        return sequenceType;
    }

    public void setSequenceType(SequenceTypeFilter sequenceType) {
        this.sequenceType = sequenceType;
    }

    public LongFilter getTranscriptId() {
        return transcriptId;
    }

    public LongFilter transcriptId() {
        if (transcriptId == null) {
            transcriptId = new LongFilter();
        }
        return transcriptId;
    }

    public void setTranscriptId(LongFilter transcriptId) {
        this.transcriptId = transcriptId;
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
        final SequenceCriteria that = (SequenceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(sequenceType, that.sequenceType) &&
            Objects.equals(transcriptId, that.transcriptId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, sequenceType, transcriptId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SequenceCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (sequenceType != null ? "sequenceType=" + sequenceType + ", " : "") +
            (transcriptId != null ? "transcriptId=" + transcriptId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
