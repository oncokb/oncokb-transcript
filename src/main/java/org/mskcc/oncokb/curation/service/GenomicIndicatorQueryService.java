package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.mskcc.oncokb.curation.repository.GenomicIndicatorRepository;
import org.mskcc.oncokb.curation.service.criteria.GenomicIndicatorCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link GenomicIndicator} entities in the database.
 * The main input is a {@link GenomicIndicatorCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link GenomicIndicator} or a {@link Page} of {@link GenomicIndicator} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class GenomicIndicatorQueryService extends QueryService<GenomicIndicator> {

    private final Logger log = LoggerFactory.getLogger(GenomicIndicatorQueryService.class);

    private final GenomicIndicatorRepository genomicIndicatorRepository;

    public GenomicIndicatorQueryService(GenomicIndicatorRepository genomicIndicatorRepository) {
        this.genomicIndicatorRepository = genomicIndicatorRepository;
    }

    /**
     * Return a {@link List} of {@link GenomicIndicator} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<GenomicIndicator> findByCriteria(GenomicIndicatorCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<GenomicIndicator> specification = createSpecification(criteria);
        return genomicIndicatorRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link GenomicIndicator} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<GenomicIndicator> findByCriteria(GenomicIndicatorCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<GenomicIndicator> specification = createSpecification(criteria);
        return genomicIndicatorRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(GenomicIndicatorCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<GenomicIndicator> specification = createSpecification(criteria);
        return genomicIndicatorRepository.count(specification);
    }

    /**
     * Function to convert {@link GenomicIndicatorCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<GenomicIndicator> createSpecification(GenomicIndicatorCriteria criteria) {
        Specification<GenomicIndicator> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), GenomicIndicator_.id));
            }
            if (criteria.getUuid() != null) {
                specification = specification.or(buildStringSpecification(criteria.getUuid(), GenomicIndicator_.uuid));
            }
            if (criteria.getType() != null) {
                specification = specification.or(buildStringSpecification(criteria.getType(), GenomicIndicator_.type));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), GenomicIndicator_.name));
            }
            if (criteria.getAlleleStateId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getAlleleStateId(),
                            root -> root.join(GenomicIndicator_.alleleStates, JoinType.LEFT).get(AlleleState_.id)
                        )
                    );
            }
            if (criteria.getAssociationId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getAssociationId(),
                            root -> root.join(GenomicIndicator_.associations, JoinType.LEFT).get(Association_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
