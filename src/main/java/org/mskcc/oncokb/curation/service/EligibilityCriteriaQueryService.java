package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.mskcc.oncokb.curation.repository.EligibilityCriteriaRepository;
import org.mskcc.oncokb.curation.service.criteria.EligibilityCriteriaCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link EligibilityCriteria} entities in the database.
 * The main input is a {@link EligibilityCriteriaCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link EligibilityCriteria} or a {@link Page} of {@link EligibilityCriteria} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class EligibilityCriteriaQueryService extends QueryService<EligibilityCriteria> {

    private final Logger log = LoggerFactory.getLogger(EligibilityCriteriaQueryService.class);

    private final EligibilityCriteriaRepository eligibilityCriteriaRepository;

    public EligibilityCriteriaQueryService(EligibilityCriteriaRepository eligibilityCriteriaRepository) {
        this.eligibilityCriteriaRepository = eligibilityCriteriaRepository;
    }

    /**
     * Return a {@link List} of {@link EligibilityCriteria} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<EligibilityCriteria> findByCriteria(EligibilityCriteriaCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<EligibilityCriteria> specification = createSpecification(criteria);
        return eligibilityCriteriaRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link EligibilityCriteria} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<EligibilityCriteria> findByCriteria(EligibilityCriteriaCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<EligibilityCriteria> specification = createSpecification(criteria);
        return eligibilityCriteriaRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(EligibilityCriteriaCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<EligibilityCriteria> specification = createSpecification(criteria);
        return eligibilityCriteriaRepository.count(specification);
    }

    /**
     * Function to convert {@link EligibilityCriteriaCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<EligibilityCriteria> createSpecification(EligibilityCriteriaCriteria criteria) {
        Specification<EligibilityCriteria> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), EligibilityCriteria_.id));
            }
            if (criteria.getType() != null) {
                specification = specification.or(buildSpecification(criteria.getType(), EligibilityCriteria_.type));
            }
            if (criteria.getPriority() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getPriority(), EligibilityCriteria_.priority));
            }
            if (criteria.getAssociationId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getAssociationId(),
                        root -> root.join(EligibilityCriteria_.associations, JoinType.LEFT).get(Association_.id)
                    )
                );
            }
            if (criteria.getClinicalTrialId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getClinicalTrialId(),
                        root -> root.join(EligibilityCriteria_.clinicalTrial, JoinType.LEFT).get(ClinicalTrial_.id)
                    )
                );
            }
        }
        return specification;
    }
}
