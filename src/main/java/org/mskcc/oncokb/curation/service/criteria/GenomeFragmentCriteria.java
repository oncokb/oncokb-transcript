package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.GenomeFragment} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.GenomeFragmentResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /genome-fragments?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class GenomeFragmentCriteria implements Serializable, Criteria {

    /**
     * Class for filtering GenomeFragmentType
     */
    public static class GenomeFragmentTypeFilter extends Filter<GenomeFragmentType> {

        public GenomeFragmentTypeFilter() {}

        public GenomeFragmentTypeFilter(GenomeFragmentTypeFilter filter) {
            super(filter);
        }

        @Override
        public GenomeFragmentTypeFilter copy() {
            return new GenomeFragmentTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private IntegerFilter start;

    private IntegerFilter end;

    private IntegerFilter strand;

    private GenomeFragmentTypeFilter type;

    private LongFilter seqRegionId;

    private LongFilter transcriptId;

    private Boolean distinct;

    public GenomeFragmentCriteria() {}

    public GenomeFragmentCriteria(GenomeFragmentCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.start = other.start == null ? null : other.start.copy();
        this.end = other.end == null ? null : other.end.copy();
        this.strand = other.strand == null ? null : other.strand.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.seqRegionId = other.seqRegionId == null ? null : other.seqRegionId.copy();
        this.transcriptId = other.transcriptId == null ? null : other.transcriptId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public GenomeFragmentCriteria copy() {
        return new GenomeFragmentCriteria(this);
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

    public IntegerFilter getStart() {
        return start;
    }

    public IntegerFilter start() {
        if (start == null) {
            start = new IntegerFilter();
        }
        return start;
    }

    public void setStart(IntegerFilter start) {
        this.start = start;
    }

    public IntegerFilter getEnd() {
        return end;
    }

    public IntegerFilter end() {
        if (end == null) {
            end = new IntegerFilter();
        }
        return end;
    }

    public void setEnd(IntegerFilter end) {
        this.end = end;
    }

    public IntegerFilter getStrand() {
        return strand;
    }

    public IntegerFilter strand() {
        if (strand == null) {
            strand = new IntegerFilter();
        }
        return strand;
    }

    public void setStrand(IntegerFilter strand) {
        this.strand = strand;
    }

    public GenomeFragmentTypeFilter getType() {
        return type;
    }

    public GenomeFragmentTypeFilter type() {
        if (type == null) {
            type = new GenomeFragmentTypeFilter();
        }
        return type;
    }

    public void setType(GenomeFragmentTypeFilter type) {
        this.type = type;
    }

    public LongFilter getSeqRegionId() {
        return seqRegionId;
    }

    public LongFilter seqRegionId() {
        if (seqRegionId == null) {
            seqRegionId = new LongFilter();
        }
        return seqRegionId;
    }

    public void setSeqRegionId(LongFilter seqRegionId) {
        this.seqRegionId = seqRegionId;
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
        final GenomeFragmentCriteria that = (GenomeFragmentCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(start, that.start) &&
            Objects.equals(end, that.end) &&
            Objects.equals(strand, that.strand) &&
            Objects.equals(type, that.type) &&
            Objects.equals(seqRegionId, that.seqRegionId) &&
            Objects.equals(transcriptId, that.transcriptId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, start, end, strand, type, seqRegionId, transcriptId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GenomeFragmentCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (start != null ? "start=" + start + ", " : "") +
            (end != null ? "end=" + end + ", " : "") +
            (strand != null ? "strand=" + strand + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (seqRegionId != null ? "seqRegionId=" + seqRegionId + ", " : "") +
            (transcriptId != null ? "transcriptId=" + transcriptId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
