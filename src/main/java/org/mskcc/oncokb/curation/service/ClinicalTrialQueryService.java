package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.ClinicalTrial;
import org.mskcc.oncokb.curation.repository.ClinicalTrialRepository;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link ClinicalTrial} entities in the database.
 * The main input is a {@link ClinicalTrialCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link ClinicalTrial} or a {@link Page} of {@link ClinicalTrial} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ClinicalTrialQueryService extends QueryService<ClinicalTrial> {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialQueryService.class);

    private final ClinicalTrialRepository clinicalTrialRepository;

    public ClinicalTrialQueryService(ClinicalTrialRepository clinicalTrialRepository) {
        this.clinicalTrialRepository = clinicalTrialRepository;
    }

    /**
     * Return a {@link List} of {@link ClinicalTrial} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<ClinicalTrial> findByCriteria(ClinicalTrialCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<ClinicalTrial> specification = createSpecification(criteria);
        return clinicalTrialRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link ClinicalTrial} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrial> findByCriteria(ClinicalTrialCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ClinicalTrial> specification = createSpecification(criteria);
        return clinicalTrialRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ClinicalTrialCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<ClinicalTrial> specification = createSpecification(criteria);
        return clinicalTrialRepository.count(specification);
    }

    /**
     * Function to convert {@link ClinicalTrialCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ClinicalTrial> createSpecification(ClinicalTrialCriteria criteria) {
        Specification<ClinicalTrial> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), ClinicalTrial_.id));
            }
            if (criteria.getNctId() != null) {
                specification = specification.or(buildStringSpecification(criteria.getNctId(), ClinicalTrial_.nctId));
            }
            if (criteria.getBriefTitle() != null) {
                specification = specification.or(buildStringSpecification(criteria.getBriefTitle(), ClinicalTrial_.briefTitle));
            }
            if (criteria.getPhase() != null) {
                specification = specification.or(buildStringSpecification(criteria.getPhase(), ClinicalTrial_.phase));
            }
            if (criteria.getStatus() != null) {
                specification = specification.or(buildStringSpecification(criteria.getStatus(), ClinicalTrial_.status));
            }
            if (criteria.getClinicalTrialArmId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getClinicalTrialArmId(),
                        root -> root.join(ClinicalTrial_.clinicalTrialArms, JoinType.LEFT).get(ClinicalTrialArm_.id)
                    )
                );
            }
            if (criteria.getEligibilityCriteriaId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getEligibilityCriteriaId(),
                        root -> root.join(ClinicalTrial_.eligibilityCriteria, JoinType.LEFT).get(EligibilityCriteria_.id)
                    )
                );
            }
            if (criteria.getAssociationId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getAssociationId(),
                        root -> root.join(ClinicalTrial_.associations, JoinType.LEFT).get(Association_.id)
                    )
                );
            }
        }
        return specification;
    }
}
