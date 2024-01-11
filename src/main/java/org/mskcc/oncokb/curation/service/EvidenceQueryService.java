package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.repository.EvidenceRepository;
import org.mskcc.oncokb.curation.service.criteria.EvidenceCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Evidence} entities in the database.
 * The main input is a {@link EvidenceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Evidence} or a {@link Page} of {@link Evidence} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class EvidenceQueryService extends QueryService<Evidence> {

    private final Logger log = LoggerFactory.getLogger(EvidenceQueryService.class);

    private final EvidenceRepository evidenceRepository;

    public EvidenceQueryService(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    /**
     * Return a {@link List} of {@link Evidence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Evidence> findByCriteria(EvidenceCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Evidence> specification = createSpecification(criteria);
        return evidenceRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Evidence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Evidence> findByCriteria(EvidenceCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Evidence> specification = createSpecification(criteria);
        return evidenceRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(EvidenceCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Evidence> specification = createSpecification(criteria);
        return evidenceRepository.count(specification);
    }

    /**
     * Function to convert {@link EvidenceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Evidence> createSpecification(EvidenceCriteria criteria) {
        Specification<Evidence> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), Evidence_.id));
            }
            if (criteria.getUuid() != null) {
                specification = specification.and(buildStringSpecification(criteria.getUuid(), Evidence_.uuid));
            }
            if (criteria.getEvidenceType() != null) {
                specification = specification.and(buildStringSpecification(criteria.getEvidenceType(), Evidence_.evidenceType));
            }
            if (criteria.getKnownEffect() != null) {
                specification = specification.and(buildStringSpecification(criteria.getKnownEffect(), Evidence_.knownEffect));
            }
            if (criteria.getAssociationId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getAssociationId(),
                            root -> root.join(Evidence_.association, JoinType.LEFT).get(Association_.id)
                        )
                    );
            }
            if (criteria.getLevelOfEvidenceId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getLevelOfEvidenceId(),
                            root -> root.join(Evidence_.levelOfEvidences, JoinType.LEFT).get(LevelOfEvidence_.id)
                        )
                    );
            }
            if (criteria.getGeneId() != null) {
                specification =
                    specification.and(
                        buildSpecification(criteria.getGeneId(), root -> root.join(Evidence_.gene, JoinType.LEFT).get(Gene_.id))
                    );
            }
        }
        return specification;
    }
}
