package org.mskcc.oncokb.curation.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.BooleanFilter;
import tech.jhipster.service.filter.DoubleFilter;
import tech.jhipster.service.filter.Filter;
import tech.jhipster.service.filter.FloatFilter;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Alteration} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.AlterationResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /alterations?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class AlterationCriteria implements Serializable, Criteria {

    /**
     * Class for filtering AlterationType
     */
    public static class AlterationTypeFilter extends Filter<AlterationType> {

        public AlterationTypeFilter() {}

        public AlterationTypeFilter(AlterationTypeFilter filter) {
            super(filter);
        }

        @Override
        public AlterationTypeFilter copy() {
            return new AlterationTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private AlterationTypeFilter type;

    private StringFilter name;

    private StringFilter alteration;

    private StringFilter proteinChange;

    private IntegerFilter start;

    private IntegerFilter end;

    private StringFilter refResidues;

    private StringFilter variantResidues;

    private LongFilter geneId;

    private LongFilter transcriptId;

    private LongFilter consequenceId;

    private LongFilter associationId;

    private Boolean distinct;

    public AlterationCriteria() {}

    public AlterationCriteria(AlterationCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.alteration = other.alteration == null ? null : other.alteration.copy();
        this.proteinChange = other.proteinChange == null ? null : other.proteinChange.copy();
        this.start = other.start == null ? null : other.start.copy();
        this.end = other.end == null ? null : other.end.copy();
        this.refResidues = other.refResidues == null ? null : other.refResidues.copy();
        this.variantResidues = other.variantResidues == null ? null : other.variantResidues.copy();
        this.geneId = other.geneId == null ? null : other.geneId.copy();
        this.transcriptId = other.transcriptId == null ? null : other.transcriptId.copy();
        this.consequenceId = other.consequenceId == null ? null : other.consequenceId.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public AlterationCriteria copy() {
        return new AlterationCriteria(this);
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

    public AlterationTypeFilter getType() {
        return type;
    }

    public AlterationTypeFilter type() {
        if (type == null) {
            type = new AlterationTypeFilter();
        }
        return type;
    }

    public void setType(AlterationTypeFilter type) {
        this.type = type;
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

    public StringFilter getAlteration() {
        return alteration;
    }

    public StringFilter alteration() {
        if (alteration == null) {
            alteration = new StringFilter();
        }
        return alteration;
    }

    public void setAlteration(StringFilter alteration) {
        this.alteration = alteration;
    }

    public StringFilter getProteinChange() {
        return proteinChange;
    }

    public StringFilter proteinChange() {
        if (proteinChange == null) {
            proteinChange = new StringFilter();
        }
        return proteinChange;
    }

    public void setProteinChange(StringFilter proteinChange) {
        this.proteinChange = proteinChange;
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

    public StringFilter getRefResidues() {
        return refResidues;
    }

    public StringFilter refResidues() {
        if (refResidues == null) {
            refResidues = new StringFilter();
        }
        return refResidues;
    }

    public void setRefResidues(StringFilter refResidues) {
        this.refResidues = refResidues;
    }

    public StringFilter getVariantResidues() {
        return variantResidues;
    }

    public StringFilter variantResidues() {
        if (variantResidues == null) {
            variantResidues = new StringFilter();
        }
        return variantResidues;
    }

    public void setVariantResidues(StringFilter variantResidues) {
        this.variantResidues = variantResidues;
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

    public LongFilter getConsequenceId() {
        return consequenceId;
    }

    public LongFilter consequenceId() {
        if (consequenceId == null) {
            consequenceId = new LongFilter();
        }
        return consequenceId;
    }

    public void setConsequenceId(LongFilter consequenceId) {
        this.consequenceId = consequenceId;
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
        final AlterationCriteria that = (AlterationCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(type, that.type) &&
            Objects.equals(name, that.name) &&
            Objects.equals(alteration, that.alteration) &&
            Objects.equals(proteinChange, that.proteinChange) &&
            Objects.equals(start, that.start) &&
            Objects.equals(end, that.end) &&
            Objects.equals(refResidues, that.refResidues) &&
            Objects.equals(variantResidues, that.variantResidues) &&
            Objects.equals(geneId, that.geneId) &&
            Objects.equals(transcriptId, that.transcriptId) &&
            Objects.equals(consequenceId, that.consequenceId) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            type,
            name,
            alteration,
            proteinChange,
            start,
            end,
            refResidues,
            variantResidues,
            geneId,
            transcriptId,
            consequenceId,
            associationId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AlterationCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (alteration != null ? "alteration=" + alteration + ", " : "") +
            (proteinChange != null ? "proteinChange=" + proteinChange + ", " : "") +
            (start != null ? "start=" + start + ", " : "") +
            (end != null ? "end=" + end + ", " : "") +
            (refResidues != null ? "refResidues=" + refResidues + ", " : "") +
            (variantResidues != null ? "variantResidues=" + variantResidues + ", " : "") +
            (geneId != null ? "geneId=" + geneId + ", " : "") +
            (transcriptId != null ? "transcriptId=" + transcriptId + ", " : "") +
            (consequenceId != null ? "consequenceId=" + consequenceId + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
