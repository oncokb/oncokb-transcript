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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Gene} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.GeneResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /genes?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class GeneCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private IntegerFilter entrezGeneId;

    private StringFilter hugoSymbol;

    private StringFilter hgncId;

    private LongFilter geneAliasId;

    private LongFilter ensemblGeneId;

    private LongFilter biomarkerAssociationId;

    private LongFilter flagId;

    private LongFilter alterationId;

    private Boolean distinct;

    public GeneCriteria() {}

    public GeneCriteria(GeneCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.entrezGeneId = other.entrezGeneId == null ? null : other.entrezGeneId.copy();
        this.hugoSymbol = other.hugoSymbol == null ? null : other.hugoSymbol.copy();
        this.hgncId = other.hgncId == null ? null : other.hgncId.copy();
        this.geneAliasId = other.geneAliasId == null ? null : other.geneAliasId.copy();
        this.ensemblGeneId = other.ensemblGeneId == null ? null : other.ensemblGeneId.copy();
        this.biomarkerAssociationId = other.biomarkerAssociationId == null ? null : other.biomarkerAssociationId.copy();
        this.flagId = other.flagId == null ? null : other.flagId.copy();
        this.alterationId = other.alterationId == null ? null : other.alterationId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public GeneCriteria copy() {
        return new GeneCriteria(this);
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

    public IntegerFilter getEntrezGeneId() {
        return entrezGeneId;
    }

    public IntegerFilter entrezGeneId() {
        if (entrezGeneId == null) {
            entrezGeneId = new IntegerFilter();
        }
        return entrezGeneId;
    }

    public void setEntrezGeneId(IntegerFilter entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public StringFilter getHugoSymbol() {
        return hugoSymbol;
    }

    public StringFilter hugoSymbol() {
        if (hugoSymbol == null) {
            hugoSymbol = new StringFilter();
        }
        return hugoSymbol;
    }

    public void setHugoSymbol(StringFilter hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public StringFilter getHgncId() {
        return hgncId;
    }

    public StringFilter hgncId() {
        if (hgncId == null) {
            hgncId = new StringFilter();
        }
        return hgncId;
    }

    public void setHgncId(StringFilter hgncId) {
        this.hgncId = hgncId;
    }

    public LongFilter getGeneAliasId() {
        return geneAliasId;
    }

    public LongFilter geneAliasId() {
        if (geneAliasId == null) {
            geneAliasId = new LongFilter();
        }
        return geneAliasId;
    }

    public void setGeneAliasId(LongFilter geneAliasId) {
        this.geneAliasId = geneAliasId;
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

    public LongFilter getAlterationId() {
        return alterationId;
    }

    public LongFilter alterationId() {
        if (alterationId == null) {
            alterationId = new LongFilter();
        }
        return alterationId;
    }

    public void setAlterationId(LongFilter alterationId) {
        this.alterationId = alterationId;
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
        final GeneCriteria that = (GeneCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(entrezGeneId, that.entrezGeneId) &&
            Objects.equals(hugoSymbol, that.hugoSymbol) &&
            Objects.equals(hgncId, that.hgncId) &&
            Objects.equals(geneAliasId, that.geneAliasId) &&
            Objects.equals(ensemblGeneId, that.ensemblGeneId) &&
            Objects.equals(biomarkerAssociationId, that.biomarkerAssociationId) &&
            Objects.equals(flagId, that.flagId) &&
            Objects.equals(alterationId, that.alterationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            entrezGeneId,
            hugoSymbol,
            hgncId,
            geneAliasId,
            ensemblGeneId,
            biomarkerAssociationId,
            flagId,
            alterationId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GeneCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (entrezGeneId != null ? "entrezGeneId=" + entrezGeneId + ", " : "") +
            (hugoSymbol != null ? "hugoSymbol=" + hugoSymbol + ", " : "") +
            (hgncId != null ? "hgncId=" + hgncId + ", " : "") +
            (geneAliasId != null ? "geneAliasId=" + geneAliasId + ", " : "") +
            (ensemblGeneId != null ? "ensemblGeneId=" + ensemblGeneId + ", " : "") +
            (biomarkerAssociationId != null ? "biomarkerAssociationId=" + biomarkerAssociationId + ", " : "") +
            (flagId != null ? "flagId=" + flagId + ", " : "") +
            (alterationId != null ? "alterationId=" + alterationId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
