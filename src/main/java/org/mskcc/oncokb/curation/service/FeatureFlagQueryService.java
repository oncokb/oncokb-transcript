package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.FeatureFlag;
import org.mskcc.oncokb.curation.repository.FeatureFlagRepository;
import org.mskcc.oncokb.curation.service.criteria.FeatureFlagCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link FeatureFlag} entities in the database.
 * The main input is a {@link FeatureFlagCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link FeatureFlag} or a {@link Page} of {@link FeatureFlag} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class FeatureFlagQueryService extends QueryService<FeatureFlag> {

    private final Logger log = LoggerFactory.getLogger(FeatureFlagQueryService.class);

    private final FeatureFlagRepository featureFlagRepository;

    public FeatureFlagQueryService(FeatureFlagRepository featureFlagRepository) {
        this.featureFlagRepository = featureFlagRepository;
    }

    /**
     * Return a {@link List} of {@link FeatureFlag} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<FeatureFlag> findByCriteria(FeatureFlagCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<FeatureFlag> specification = createSpecification(criteria);
        return featureFlagRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link FeatureFlag} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<FeatureFlag> findByCriteria(FeatureFlagCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<FeatureFlag> specification = createSpecification(criteria);
        return featureFlagRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(FeatureFlagCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<FeatureFlag> specification = createSpecification(criteria);
        return featureFlagRepository.count(specification);
    }

    /**
     * Function to convert {@link FeatureFlagCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<FeatureFlag> createSpecification(FeatureFlagCriteria criteria) {
        Specification<FeatureFlag> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), FeatureFlag_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.and(buildStringSpecification(criteria.getName(), FeatureFlag_.name));
            }
            if (criteria.getDescription() != null) {
                specification = specification.and(buildStringSpecification(criteria.getDescription(), FeatureFlag_.description));
            }
            if (criteria.getEnabled() != null) {
                specification = specification.and(buildSpecification(criteria.getEnabled(), FeatureFlag_.enabled));
            }
            if (criteria.getUserId() != null) {
                specification = specification.and(
                    buildSpecification(criteria.getUserId(), root -> root.join(FeatureFlag_.users, JoinType.LEFT).get(User_.id))
                );
            }
        }
        return specification;
    }
}
