package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.repository.ConsequenceRepository;
import org.mskcc.oncokb.curation.service.criteria.ConsequenceCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Consequence} entities in the database.
 * The main input is a {@link ConsequenceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Consequence} or a {@link Page} of {@link Consequence} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ConsequenceQueryService extends QueryService<Consequence> {

    private final Logger log = LoggerFactory.getLogger(ConsequenceQueryService.class);

    private final ConsequenceRepository consequenceRepository;

    public ConsequenceQueryService(ConsequenceRepository consequenceRepository) {
        this.consequenceRepository = consequenceRepository;
    }

    /**
     * Return a {@link List} of {@link Consequence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Consequence> findByCriteria(ConsequenceCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Consequence> specification = createSpecification(criteria);
        return consequenceRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Consequence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Consequence> findByCriteria(ConsequenceCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Consequence> specification = createSpecification(criteria);
        return consequenceRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ConsequenceCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Consequence> specification = createSpecification(criteria);
        return consequenceRepository.count(specification);
    }

    /**
     * Function to convert {@link ConsequenceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Consequence> createSpecification(ConsequenceCriteria criteria) {
        Specification<Consequence> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Consequence_.id));
            }
            if (criteria.getTerm() != null) {
                specification = specification.or(buildStringSpecification(criteria.getTerm(), Consequence_.term));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), Consequence_.name));
            }
            if (criteria.getIsGenerallyTruncating() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getIsGenerallyTruncating(), Consequence_.isGenerallyTruncating)
                );
            }
            if (criteria.getDescription() != null) {
                specification = specification.or(buildStringSpecification(criteria.getDescription(), Consequence_.description));
            }
            if (criteria.getAlterationId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getAlterationId(),
                        root -> root.join(Consequence_.alterations, JoinType.LEFT).get(Alteration_.id)
                    )
                );
            }
            if (criteria.getCategoricalAlterationId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getCategoricalAlterationId(),
                        root -> root.join(Consequence_.categoricalAlterations, JoinType.LEFT).get(CategoricalAlteration_.id)
                    )
                );
            }
        }
        return specification;
    }
}
