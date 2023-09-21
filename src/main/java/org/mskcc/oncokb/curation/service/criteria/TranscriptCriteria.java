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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Transcript} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.TranscriptResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /transcripts?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class TranscriptCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter ensemblTranscriptId;

    private BooleanFilter canonical;

    private StringFilter ensemblProteinId;

    private StringFilter referenceSequenceId;

    private StringFilter description;

    private LongFilter fragmentsId;

    private LongFilter sequenceId;

    private LongFilter flagId;

    private LongFilter ensemblGeneId;

    private Boolean distinct;

    public TranscriptCriteria() {}

    public TranscriptCriteria(TranscriptCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.ensemblTranscriptId = other.ensemblTranscriptId == null ? null : other.ensemblTranscriptId.copy();
        this.canonical = other.canonical == null ? null : other.canonical.copy();
        this.ensemblProteinId = other.ensemblProteinId == null ? null : other.ensemblProteinId.copy();
        this.referenceSequenceId = other.referenceSequenceId == null ? null : other.referenceSequenceId.copy();
        this.description = other.description == null ? null : other.description.copy();
        this.fragmentsId = other.fragmentsId == null ? null : other.fragmentsId.copy();
        this.sequenceId = other.sequenceId == null ? null : other.sequenceId.copy();
        this.flagId = other.flagId == null ? null : other.flagId.copy();
        this.ensemblGeneId = other.ensemblGeneId == null ? null : other.ensemblGeneId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public TranscriptCriteria copy() {
        return new TranscriptCriteria(this);
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

    public StringFilter getEnsemblTranscriptId() {
        return ensemblTranscriptId;
    }

    public StringFilter ensemblTranscriptId() {
        if (ensemblTranscriptId == null) {
            ensemblTranscriptId = new StringFilter();
        }
        return ensemblTranscriptId;
    }

    public void setEnsemblTranscriptId(StringFilter ensemblTranscriptId) {
        this.ensemblTranscriptId = ensemblTranscriptId;
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

    public StringFilter getEnsemblProteinId() {
        return ensemblProteinId;
    }

    public StringFilter ensemblProteinId() {
        if (ensemblProteinId == null) {
            ensemblProteinId = new StringFilter();
        }
        return ensemblProteinId;
    }

    public void setEnsemblProteinId(StringFilter ensemblProteinId) {
        this.ensemblProteinId = ensemblProteinId;
    }

    public StringFilter getReferenceSequenceId() {
        return referenceSequenceId;
    }

    public StringFilter referenceSequenceId() {
        if (referenceSequenceId == null) {
            referenceSequenceId = new StringFilter();
        }
        return referenceSequenceId;
    }

    public void setReferenceSequenceId(StringFilter referenceSequenceId) {
        this.referenceSequenceId = referenceSequenceId;
    }

    public StringFilter getDescription() {
        return description;
    }

    public StringFilter description() {
        if (description == null) {
            description = new StringFilter();
        }
        return description;
    }

    public void setDescription(StringFilter description) {
        this.description = description;
    }

    public LongFilter getFragmentsId() {
        return fragmentsId;
    }

    public LongFilter fragmentsId() {
        if (fragmentsId == null) {
            fragmentsId = new LongFilter();
        }
        return fragmentsId;
    }

    public void setFragmentsId(LongFilter fragmentsId) {
        this.fragmentsId = fragmentsId;
    }

    public LongFilter getSequenceId() {
        return sequenceId;
    }

    public LongFilter sequenceId() {
        if (sequenceId == null) {
            sequenceId = new LongFilter();
        }
        return sequenceId;
    }

    public void setSequenceId(LongFilter sequenceId) {
        this.sequenceId = sequenceId;
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

    public LongFilter getEnsemblGeneId() {
        return ensemblGeneId;
    }

    public LongFilter ensemblGeneId() {
        if (ensemblGeneId == null) {
            ensemblGeneId = new LongFilter();
        }
        return ensemblGeneId;
    }

    public void setEnsemblGeneId(LongFilter ensemblGeneId) {
        this.ensemblGeneId = ensemblGeneId;
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
        final TranscriptCriteria that = (TranscriptCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(ensemblTranscriptId, that.ensemblTranscriptId) &&
            Objects.equals(canonical, that.canonical) &&
            Objects.equals(ensemblProteinId, that.ensemblProteinId) &&
            Objects.equals(referenceSequenceId, that.referenceSequenceId) &&
            Objects.equals(description, that.description) &&
            Objects.equals(fragmentsId, that.fragmentsId) &&
            Objects.equals(sequenceId, that.sequenceId) &&
            Objects.equals(flagId, that.flagId) &&
            Objects.equals(ensemblGeneId, that.ensemblGeneId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            ensemblTranscriptId,
            canonical,
            ensemblProteinId,
            referenceSequenceId,
            description,
            fragmentsId,
            sequenceId,
            flagId,
            ensemblGeneId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TranscriptCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (ensemblTranscriptId != null ? "ensemblTranscriptId=" + ensemblTranscriptId + ", " : "") +
            (canonical != null ? "canonical=" + canonical + ", " : "") +
            (ensemblProteinId != null ? "ensemblProteinId=" + ensemblProteinId + ", " : "") +
            (referenceSequenceId != null ? "referenceSequenceId=" + referenceSequenceId + ", " : "") +
            (description != null ? "description=" + description + ", " : "") +
            (fragmentsId != null ? "fragmentsId=" + fragmentsId + ", " : "") +
            (sequenceId != null ? "sequenceId=" + sequenceId + ", " : "") +
            (flagId != null ? "flagId=" + flagId + ", " : "") +
            (ensemblGeneId != null ? "ensemblGeneId=" + ensemblGeneId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
