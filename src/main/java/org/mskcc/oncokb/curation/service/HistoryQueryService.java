package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.History;
import org.mskcc.oncokb.curation.repository.HistoryRepository;
import org.mskcc.oncokb.curation.service.criteria.HistoryCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link History} entities in the database.
 * The main input is a {@link HistoryCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link History} or a {@link Page} of {@link History} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class HistoryQueryService extends QueryService<History> {

    private final Logger log = LoggerFactory.getLogger(HistoryQueryService.class);

    private final HistoryRepository historyRepository;

    public HistoryQueryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    /**
     * Return a {@link List} of {@link History} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<History> findByCriteria(HistoryCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<History> specification = createSpecification(criteria);
        return historyRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link History} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<History> findByCriteria(HistoryCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<History> specification = createSpecification(criteria);
        return historyRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(HistoryCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<History> specification = createSpecification(criteria);
        return historyRepository.count(specification);
    }

    /**
     * Function to convert {@link HistoryCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<History> createSpecification(HistoryCriteria criteria) {
        Specification<History> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), History_.id));
            }
            if (criteria.getType() != null) {
                specification = specification.and(buildStringSpecification(criteria.getType(), History_.type));
            }
            if (criteria.getUpdatedTime() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getUpdatedTime(), History_.updatedTime));
            }
            if (criteria.getUpdatedBy() != null) {
                specification = specification.and(buildStringSpecification(criteria.getUpdatedBy(), History_.updatedBy));
            }
            if (criteria.getEntityName() != null) {
                specification = specification.and(buildStringSpecification(criteria.getEntityName(), History_.entityName));
            }
            if (criteria.getEntityId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getEntityId(), History_.entityId));
            }
        }
        return specification;
    }
}
