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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Alteration} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.AlterationResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /alterations?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class AlterationCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter name;

    private StringFilter alteration;

    private IntegerFilter proteinStart;

    private IntegerFilter proteinEnd;

    private StringFilter refResidues;

    private StringFilter variantResidues;

    private LongFilter biomarkerAssociationId;

    private LongFilter referenceGenomesId;

    private LongFilter geneId;

    private LongFilter consequenceId;

    private Boolean distinct;

    public AlterationCriteria() {}

    public AlterationCriteria(AlterationCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.name = other.name == null ? null : other.name.copy();
        this.alteration = other.alteration == null ? null : other.alteration.copy();
        this.proteinStart = other.proteinStart == null ? null : other.proteinStart.copy();
        this.proteinEnd = other.proteinEnd == null ? null : other.proteinEnd.copy();
        this.refResidues = other.refResidues == null ? null : other.refResidues.copy();
        this.variantResidues = other.variantResidues == null ? null : other.variantResidues.copy();
        this.biomarkerAssociationId = other.biomarkerAssociationId == null ? null : other.biomarkerAssociationId.copy();
        this.referenceGenomesId = other.referenceGenomesId == null ? null : other.referenceGenomesId.copy();
        this.geneId = other.geneId == null ? null : other.geneId.copy();
        this.consequenceId = other.consequenceId == null ? null : other.consequenceId.copy();
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

    public IntegerFilter getProteinStart() {
        return proteinStart;
    }

    public IntegerFilter proteinStart() {
        if (proteinStart == null) {
            proteinStart = new IntegerFilter();
        }
        return proteinStart;
    }

    public void setProteinStart(IntegerFilter proteinStart) {
        this.proteinStart = proteinStart;
    }

    public IntegerFilter getProteinEnd() {
        return proteinEnd;
    }

    public IntegerFilter proteinEnd() {
        if (proteinEnd == null) {
            proteinEnd = new IntegerFilter();
        }
        return proteinEnd;
    }

    public void setProteinEnd(IntegerFilter proteinEnd) {
        this.proteinEnd = proteinEnd;
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

    public LongFilter getReferenceGenomesId() {
        return referenceGenomesId;
    }

    public LongFilter referenceGenomesId() {
        if (referenceGenomesId == null) {
            referenceGenomesId = new LongFilter();
        }
        return referenceGenomesId;
    }

    public void setReferenceGenomesId(LongFilter referenceGenomesId) {
        this.referenceGenomesId = referenceGenomesId;
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
            Objects.equals(name, that.name) &&
            Objects.equals(alteration, that.alteration) &&
            Objects.equals(proteinStart, that.proteinStart) &&
            Objects.equals(proteinEnd, that.proteinEnd) &&
            Objects.equals(refResidues, that.refResidues) &&
            Objects.equals(variantResidues, that.variantResidues) &&
            Objects.equals(biomarkerAssociationId, that.biomarkerAssociationId) &&
            Objects.equals(referenceGenomesId, that.referenceGenomesId) &&
            Objects.equals(geneId, that.geneId) &&
            Objects.equals(consequenceId, that.consequenceId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            name,
            alteration,
            proteinStart,
            proteinEnd,
            refResidues,
            variantResidues,
            biomarkerAssociationId,
            referenceGenomesId,
            geneId,
            consequenceId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AlterationCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (name != null ? "name=" + name + ", " : "") +
            (alteration != null ? "alteration=" + alteration + ", " : "") +
            (proteinStart != null ? "proteinStart=" + proteinStart + ", " : "") +
            (proteinEnd != null ? "proteinEnd=" + proteinEnd + ", " : "") +
            (refResidues != null ? "refResidues=" + refResidues + ", " : "") +
            (variantResidues != null ? "variantResidues=" + variantResidues + ", " : "") +
            (biomarkerAssociationId != null ? "biomarkerAssociationId=" + biomarkerAssociationId + ", " : "") +
            (referenceGenomesId != null ? "referenceGenomesId=" + referenceGenomesId + ", " : "") +
            (geneId != null ? "geneId=" + geneId + ", " : "") +
            (consequenceId != null ? "consequenceId=" + consequenceId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
