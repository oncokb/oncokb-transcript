package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.mskcc.oncokb.curation.repository.ClinicalTrialsGovConditionRepository;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialsGovConditionCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;
import tech.jhipster.service.filter.StringFilter;

/**
 * Service for executing complex queries for {@link ClinicalTrialsGovCondition} entities in the database.
 * The main input is a {@link ClinicalTrialsGovConditionCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link ClinicalTrialsGovCondition} or a {@link Page} of {@link ClinicalTrialsGovCondition} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ClinicalTrialsGovConditionQueryService extends QueryService<ClinicalTrialsGovCondition> {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialsGovConditionQueryService.class);

    private final ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository;

    public ClinicalTrialsGovConditionQueryService(ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository) {
        this.clinicalTrialsGovConditionRepository = clinicalTrialsGovConditionRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClinicalTrialsGovCondition> findBySearchQuery(String query, Pageable page) {
        ClinicalTrialsGovConditionCriteria criteria = new ClinicalTrialsGovConditionCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setName(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return a {@link List} of {@link ClinicalTrialsGovCondition} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<ClinicalTrialsGovCondition> findByCriteria(ClinicalTrialsGovConditionCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<ClinicalTrialsGovCondition> specification = createSpecification(criteria);
        return clinicalTrialsGovConditionRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link ClinicalTrialsGovCondition} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrialsGovCondition> findByCriteria(ClinicalTrialsGovConditionCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ClinicalTrialsGovCondition> specification = createSpecification(criteria);
        return clinicalTrialsGovConditionRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ClinicalTrialsGovConditionCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<ClinicalTrialsGovCondition> specification = createSpecification(criteria);
        return clinicalTrialsGovConditionRepository.count(specification);
    }

    /**
     * Function to convert {@link ClinicalTrialsGovConditionCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ClinicalTrialsGovCondition> createSpecification(ClinicalTrialsGovConditionCriteria criteria) {
        Specification<ClinicalTrialsGovCondition> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), ClinicalTrialsGovCondition_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), ClinicalTrialsGovCondition_.name));
            }
            if (criteria.getCancerTypeId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getCancerTypeId(),
                            root -> root.join(ClinicalTrialsGovCondition_.cancerTypes, JoinType.LEFT).get(CancerType_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
