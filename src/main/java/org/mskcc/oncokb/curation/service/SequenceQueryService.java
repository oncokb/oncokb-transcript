package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.repository.SequenceRepository;
import org.mskcc.oncokb.curation.service.criteria.SequenceCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Sequence} entities in the database.
 * The main input is a {@link SequenceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Sequence} or a {@link Page} of {@link Sequence} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SequenceQueryService extends QueryService<Sequence> {

    private final Logger log = LoggerFactory.getLogger(SequenceQueryService.class);

    private final SequenceRepository sequenceRepository;

    public SequenceQueryService(SequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    /**
     * Return a {@link List} of {@link Sequence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Sequence> findByCriteria(SequenceCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Sequence> specification = createSpecification(criteria);
        return sequenceRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Sequence} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Sequence> findByCriteria(SequenceCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Sequence> specification = createSpecification(criteria);
        return sequenceRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SequenceCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Sequence> specification = createSpecification(criteria);
        return sequenceRepository.count(specification);
    }

    /**
     * Function to convert {@link SequenceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Sequence> createSpecification(SequenceCriteria criteria) {
        Specification<Sequence> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Sequence_.id));
            }
            if (criteria.getSequenceType() != null) {
                specification = specification.or(buildSpecification(criteria.getSequenceType(), Sequence_.sequenceType));
            }
            if (criteria.getTranscriptId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getTranscriptId(),
                            root -> root.join(Sequence_.transcript, JoinType.LEFT).get(Transcript_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
