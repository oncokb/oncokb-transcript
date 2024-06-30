package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.mskcc.oncokb.curation.repository.ClinicalTrialArmRepository;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialArmCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link ClinicalTrialArm} entities in the database.
 * The main input is a {@link ClinicalTrialArmCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link ClinicalTrialArm} or a {@link Page} of {@link ClinicalTrialArm} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ClinicalTrialArmQueryService extends QueryService<ClinicalTrialArm> {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialArmQueryService.class);

    private final ClinicalTrialArmRepository clinicalTrialArmRepository;

    public ClinicalTrialArmQueryService(ClinicalTrialArmRepository clinicalTrialArmRepository) {
        this.clinicalTrialArmRepository = clinicalTrialArmRepository;
    }

    /**
     * Return a {@link List} of {@link ClinicalTrialArm} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<ClinicalTrialArm> findByCriteria(ClinicalTrialArmCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<ClinicalTrialArm> specification = createSpecification(criteria);
        return clinicalTrialArmRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link ClinicalTrialArm} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrialArm> findByCriteria(ClinicalTrialArmCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ClinicalTrialArm> specification = createSpecification(criteria);
        return clinicalTrialArmRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ClinicalTrialArmCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<ClinicalTrialArm> specification = createSpecification(criteria);
        return clinicalTrialArmRepository.count(specification);
    }

    /**
     * Function to convert {@link ClinicalTrialArmCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ClinicalTrialArm> createSpecification(ClinicalTrialArmCriteria criteria) {
        Specification<ClinicalTrialArm> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), ClinicalTrialArm_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), ClinicalTrialArm_.name));
            }
            if (criteria.getAssociationId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getAssociationId(),
                        root -> root.join(ClinicalTrialArm_.associations, JoinType.LEFT).get(Association_.id)
                    )
                );
            }
            if (criteria.getClinicalTrialId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getClinicalTrialId(),
                        root -> root.join(ClinicalTrialArm_.clinicalTrial, JoinType.LEFT).get(ClinicalTrial_.id)
                    )
                );
            }
        }
        return specification;
    }
}
