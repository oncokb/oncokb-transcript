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
 * Criteria class for the {@link org.mskcc.oncokb.curation.domain.Evidence} entity. This class is used
 * in {@link org.mskcc.oncokb.curation.web.rest.EvidenceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /evidences?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class EvidenceCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter uuid;

    private StringFilter evidenceType;

    private StringFilter knownEffect;

    private LongFilter associationId;

    private LongFilter levelOfEvidenceId;

    private LongFilter entrezGeneId;

    private Boolean distinct;

    public EvidenceCriteria() {}

    public EvidenceCriteria(EvidenceCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.uuid = other.uuid == null ? null : other.uuid.copy();
        this.evidenceType = other.evidenceType == null ? null : other.evidenceType.copy();
        this.knownEffect = other.knownEffect == null ? null : other.knownEffect.copy();
        this.associationId = other.associationId == null ? null : other.associationId.copy();
        this.levelOfEvidenceId = other.levelOfEvidenceId == null ? null : other.levelOfEvidenceId.copy();
        this.entrezGeneId = other.entrezGeneId == null ? null : other.entrezGeneId.copy();
        this.distinct = other.distinct;
    }

    @Override
    public EvidenceCriteria copy() {
        return new EvidenceCriteria(this);
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

    public StringFilter getUuid() {
        return uuid;
    }

    public StringFilter uuid() {
        if (uuid == null) {
            uuid = new StringFilter();
        }
        return uuid;
    }

    public void setUuid(StringFilter uuid) {
        this.uuid = uuid;
    }

    public StringFilter getEvidenceType() {
        return evidenceType;
    }

    public StringFilter evidenceType() {
        if (evidenceType == null) {
            evidenceType = new StringFilter();
        }
        return evidenceType;
    }

    public void setEvidenceType(StringFilter evidenceType) {
        this.evidenceType = evidenceType;
    }

    public StringFilter getKnownEffect() {
        return knownEffect;
    }

    public StringFilter knownEffect() {
        if (knownEffect == null) {
            knownEffect = new StringFilter();
        }
        return knownEffect;
    }

    public void setKnownEffect(StringFilter knownEffect) {
        this.knownEffect = knownEffect;
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

    public LongFilter getLevelOfEvidenceId() {
        return levelOfEvidenceId;
    }

    public LongFilter levelOfEvidenceId() {
        if (levelOfEvidenceId == null) {
            levelOfEvidenceId = new LongFilter();
        }
        return levelOfEvidenceId;
    }

    public void setLevelOfEvidenceId(LongFilter levelOfEvidenceId) {
        this.levelOfEvidenceId = levelOfEvidenceId;
    }

    public LongFilter getEntrezGeneId() {
        return entrezGeneId;
    }

    public LongFilter entrezGeneId() {
        if (entrezGeneId == null) {
            entrezGeneId = new LongFilter();
        }
        return entrezGeneId;
    }

    public void setEntrezGeneId(LongFilter entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
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
        final EvidenceCriteria that = (EvidenceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(uuid, that.uuid) &&
            Objects.equals(evidenceType, that.evidenceType) &&
            Objects.equals(knownEffect, that.knownEffect) &&
            Objects.equals(associationId, that.associationId) &&
            Objects.equals(levelOfEvidenceId, that.levelOfEvidenceId) &&
            Objects.equals(entrezGeneId, that.entrezGeneId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid, evidenceType, knownEffect, associationId, levelOfEvidenceId, entrezGeneId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EvidenceCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (uuid != null ? "uuid=" + uuid + ", " : "") +
            (evidenceType != null ? "evidenceType=" + evidenceType + ", " : "") +
            (knownEffect != null ? "knownEffect=" + knownEffect + ", " : "") +
            (associationId != null ? "associationId=" + associationId + ", " : "") +
            (levelOfEvidenceId != null ? "levelOfEvidenceId=" + levelOfEvidenceId + ", " : "") +
            (entrezGeneId != null ? "entrezGeneId=" + entrezGeneId + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
