package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.EnsemblGene} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.EnsemblGeneResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /ensembl-genes?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class EnsemblGeneCriteria implements Serializable, Criteria {

    /**
     * Class for filtering ReferenceGenome
     */
    public static class ReferenceGenomeFilter extends Filter<ReferenceGenome> {

        public ReferenceGenomeFilter() {}

        public ReferenceGenomeFilter(ReferenceGenomeFilter filter) {
            super(filter);
        }

        @Override
        public ReferenceGenomeFilter copy() {
            return new ReferenceGenomeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private ReferenceGenomeFilter referenceGenome;

    private StringFilter ensemblGeneId;

    private BooleanFilter canonical;

    private IntegerFilter start;

    private IntegerFilter end;

    private IntegerFilter strand;

    private LongFilter transcriptId;

    private LongFilter geneId;

    private LongFilter seqRegionId;

    private Boolean distinct;

    public EnsemblGeneCriteria() {}

    public EnsemblGeneCriteria(EnsemblGeneCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.referenceGenome = other.referenceGenome == null ? null : other.referenceGenome.copy();
        this.ensemblGeneId = other.ensemblGeneId == null ? null : other.ensemblGeneId.copy();
        this.canonical = other.canonical == null ? null : other.canonical.copy();
        this.start = other.start == null ? null : other.start.copy();
        this.end = other.end == null ? null : other.end.copy();
        this.strand = other.strand == null ? null : other.strand.copy();
        this.transcriptId = other.transcriptId == null ? null : other.transcriptId.copy();
        this.geneId = other.geneId == null ? null : other.geneId.copy();
        this.seqRegionId = other.seqRegionId == null ? null : other.seqRegionId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public EnsemblGeneCriteria copy() {
        return new EnsemblGeneCriteria(this);
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

    public ReferenceGenomeFilter getReferenceGenome() {
        return referenceGenome;
    }

    public ReferenceGenomeFilter referenceGenome() {
        if (referenceGenome == null) {
            referenceGenome = new ReferenceGenomeFilter();
        }
        return referenceGenome;
    }

    public void setReferenceGenome(ReferenceGenomeFilter referenceGenome) {
        this.referenceGenome = referenceGenome;
    }

    public StringFilter getEnsemblGeneId() {
        return ensemblGeneId;
    }

    public StringFilter ensemblGeneId() {
        if (ensemblGeneId == null) {
            ensemblGeneId = new StringFilter();
        }
        return ensemblGeneId;
    }

    public void setEnsemblGeneId(StringFilter ensemblGeneId) {
        this.ensemblGeneId = ensemblGeneId;
    }

    public BooleanFilter getCanonical() {
        return canonical;
    }

    public BooleanFilter canonical() {
        if (canonical == null) {
            canonical = new BooleanFilter();
        }
        return canonical;
    }

    public void setCanonical(BooleanFilter canonical) {
        this.canonical = canonical;
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

    public LongFilter getGeneId() {
        return geneId;
    }

    public LongFilter geneId() {
        if (geneId == null) {
            geneId = new LongFilter();
        }
        return geneId;
    }

    public void setGeneId(LongFilter geneId) {
        this.geneId = geneId;
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
        final EnsemblGeneCriteria that = (EnsemblGeneCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(referenceGenome, that.referenceGenome) &&
            Objects.equals(ensemblGeneId, that.ensemblGeneId) &&
            Objects.equals(canonical, that.canonical) &&
            Objects.equals(start, that.start) &&
            Objects.equals(end, that.end) &&
            Objects.equals(strand, that.strand) &&
            Objects.equals(transcriptId, that.transcriptId) &&
            Objects.equals(geneId, that.geneId) &&
            Objects.equals(seqRegionId, that.seqRegionId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, referenceGenome, ensemblGeneId, canonical, start, end, strand, transcriptId, geneId, seqRegionId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EnsemblGeneCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (referenceGenome != null ? "referenceGenome=" + referenceGenome + ", " : "") +
            (ensemblGeneId != null ? "ensemblGeneId=" + ensemblGeneId + ", " : "") +
            (canonical != null ? "canonical=" + canonical + ", " : "") +
            (start != null ? "start=" + start + ", " : "") +
            (end != null ? "end=" + end + ", " : "") +
            (strand != null ? "strand=" + strand + ", " : "") +
            (transcriptId != null ? "transcriptId=" + transcriptId + ", " : "") +
            (geneId != null ? "geneId=" + geneId + ", " : "") +
            (seqRegionId != null ? "seqRegionId=" + seqRegionId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
