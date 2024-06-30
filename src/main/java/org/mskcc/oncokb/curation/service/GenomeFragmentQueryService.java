package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.repository.GenomeFragmentRepository;
import org.mskcc.oncokb.curation.service.criteria.GenomeFragmentCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link GenomeFragment} entities in the database.
 * The main input is a {@link GenomeFragmentCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link GenomeFragment} or a {@link Page} of {@link GenomeFragment} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class GenomeFragmentQueryService extends QueryService<GenomeFragment> {

    private final Logger log = LoggerFactory.getLogger(GenomeFragmentQueryService.class);

    private final GenomeFragmentRepository genomeFragmentRepository;

    public GenomeFragmentQueryService(GenomeFragmentRepository genomeFragmentRepository) {
        this.genomeFragmentRepository = genomeFragmentRepository;
    }

    /**
     * Return a {@link List} of {@link GenomeFragment} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<GenomeFragment> findByCriteria(GenomeFragmentCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<GenomeFragment> specification = createSpecification(criteria);
        return genomeFragmentRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link GenomeFragment} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<GenomeFragment> findByCriteria(GenomeFragmentCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<GenomeFragment> specification = createSpecification(criteria);
        return genomeFragmentRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(GenomeFragmentCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<GenomeFragment> specification = createSpecification(criteria);
        return genomeFragmentRepository.count(specification);
    }

    /**
     * Function to convert {@link GenomeFragmentCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<GenomeFragment> createSpecification(GenomeFragmentCriteria criteria) {
        Specification<GenomeFragment> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), GenomeFragment_.id));
            }
            if (criteria.getStart() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getStart(), GenomeFragment_.start));
            }
            if (criteria.getEnd() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getEnd(), GenomeFragment_.end));
            }
            if (criteria.getStrand() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getStrand(), GenomeFragment_.strand));
            }
            if (criteria.getType() != null) {
                specification = specification.or(buildSpecification(criteria.getType(), GenomeFragment_.type));
            }
            if (criteria.getSeqRegionId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getSeqRegionId(),
                        root -> root.join(GenomeFragment_.seqRegion, JoinType.LEFT).get(SeqRegion_.id)
                    )
                );
            }
            if (criteria.getTranscriptId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getTranscriptId(),
                        root -> root.join(GenomeFragment_.transcript, JoinType.LEFT).get(Transcript_.id)
                    )
                );
            }
        }
        return specification;
    }
}
