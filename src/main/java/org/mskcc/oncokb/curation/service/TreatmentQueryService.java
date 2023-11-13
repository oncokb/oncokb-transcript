package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Treatment;
import org.mskcc.oncokb.curation.repository.TreatmentRepository;
import org.mskcc.oncokb.curation.service.criteria.TreatmentCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Treatment} entities in the database.
 * The main input is a {@link TreatmentCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Treatment} or a {@link Page} of {@link Treatment} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TreatmentQueryService extends QueryService<Treatment> {

    private final Logger log = LoggerFactory.getLogger(TreatmentQueryService.class);

    private final TreatmentRepository treatmentRepository;

    public TreatmentQueryService(TreatmentRepository treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }

    /**
     * Return a {@link List} of {@link Treatment} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Treatment> findByCriteria(TreatmentCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Treatment> specification = createSpecification(criteria);
        return treatmentRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Treatment} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Treatment> findByCriteria(TreatmentCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Treatment> specification = createSpecification(criteria);
        return treatmentRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TreatmentCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Treatment> specification = createSpecification(criteria);
        return treatmentRepository.count(specification);
    }

    /**
     * Function to convert {@link TreatmentCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Treatment> createSpecification(TreatmentCriteria criteria) {
        Specification<Treatment> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), Treatment_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.and(buildStringSpecification(criteria.getName(), Treatment_.name));
            }
            if (criteria.getTreatmentPriorityId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getTreatmentPriorityId(),
                            root -> root.join(Treatment_.treatmentPriorities, JoinType.LEFT).get(TreatmentPriority_.id)
                        )
                    );
            }
            if (criteria.getDrugId() != null) {
                specification =
                    specification.and(
                        buildSpecification(criteria.getDrugId(), root -> root.join(Treatment_.drugs, JoinType.LEFT).get(Drug_.id))
                    );
            }
            if (criteria.getAssociationId() != null) {
                specification =
                    specification.and(
                        buildSpecification(
                            criteria.getAssociationId(),
                            root -> root.join(Treatment_.associations, JoinType.LEFT).get(Association_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
