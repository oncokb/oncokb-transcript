package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.service.criteria.CancerTypeCriteria;
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
 * Service for executing complex queries for {@link CancerType} entities in the database.
 * The main input is a {@link CancerTypeCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link CancerType} or a {@link Page} of {@link CancerType} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class CancerTypeQueryService extends QueryService<CancerType> {

    private final Logger log = LoggerFactory.getLogger(CancerTypeQueryService.class);

    private final CancerTypeRepository cancerTypeRepository;

    public CancerTypeQueryService(CancerTypeRepository cancerTypeRepository) {
        this.cancerTypeRepository = cancerTypeRepository;
    }

    @Transactional(readOnly = true)
    public Page<CancerType> findBySearchQuery(String query, Pageable page) {
        CancerTypeCriteria cancerTypeCriteria = new CancerTypeCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        cancerTypeCriteria.setMainType(stringFilter);
        return findByCriteria(cancerTypeCriteria, page);
    }

    /**
     * Return a {@link List} of {@link CancerType} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<CancerType> findByCriteria(CancerTypeCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<CancerType> specification = createSpecification(criteria);
        return cancerTypeRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link CancerType} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<CancerType> findByCriteria(CancerTypeCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<CancerType> specification = createSpecification(criteria);
        return cancerTypeRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(CancerTypeCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<CancerType> specification = createSpecification(criteria);
        return cancerTypeRepository.count(specification);
    }

    /**
     * Function to convert {@link CancerTypeCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<CancerType> createSpecification(CancerTypeCriteria criteria) {
        Specification<CancerType> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), CancerType_.id));
            }
            if (criteria.getCode() != null) {
                specification = specification.and(buildStringSpecification(criteria.getCode(), CancerType_.code));
            }
            if (criteria.getColor() != null) {
                specification = specification.and(buildStringSpecification(criteria.getColor(), CancerType_.color));
            }
            if (criteria.getLevel() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getLevel(), CancerType_.level));
            }
            if (criteria.getMainType() != null) {
                specification = specification.and(buildStringSpecification(criteria.getMainType(), CancerType_.mainType));
            }
            if (criteria.getSubtype() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSubtype(), CancerType_.subtype));
            }
            if (criteria.getTissue() != null) {
                specification = specification.and(buildStringSpecification(criteria.getTissue(), CancerType_.tissue));
            }
            if (criteria.getTumorForm() != null) {
                specification = specification.and(buildSpecification(criteria.getTumorForm(), CancerType_.tumorForm));
            }
            if (criteria.getChildrenId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getChildrenId(),
                            root -> root.join(CancerType_.children, JoinType.LEFT).get(CancerType_.id)
                        )
                    );
            }
            if (criteria.getDeviceUsageIndicationId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getDeviceUsageIndicationId(),
                            root -> root.join(CancerType_.deviceUsageIndications, JoinType.LEFT).get(DeviceUsageIndication_.id)
                        )
                    );
            }
            if (criteria.getParentId() != null) {
                specification =
                    specification.and(
                        buildSpecification(criteria.getParentId(), root -> root.join(CancerType_.parent, JoinType.LEFT).get(CancerType_.id))
                    );
            }
        }
        return specification;
    }
}
