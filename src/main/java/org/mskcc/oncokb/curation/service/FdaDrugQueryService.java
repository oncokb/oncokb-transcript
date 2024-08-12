package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.mskcc.oncokb.curation.repository.FdaDrugRepository;
import org.mskcc.oncokb.curation.service.criteria.FdaDrugCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link FdaDrug} entities in the database.
 * The main input is a {@link FdaDrugCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link FdaDrug} or a {@link Page} of {@link FdaDrug} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class FdaDrugQueryService extends QueryService<FdaDrug> {

    private final Logger log = LoggerFactory.getLogger(FdaDrugQueryService.class);

    private final FdaDrugRepository fdaDrugRepository;

    public FdaDrugQueryService(FdaDrugRepository fdaDrugRepository) {
        this.fdaDrugRepository = fdaDrugRepository;
    }

    /**
     * Return a {@link List} of {@link FdaDrug} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<FdaDrug> findByCriteria(FdaDrugCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<FdaDrug> specification = createSpecification(criteria);
        return fdaDrugRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link FdaDrug} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<FdaDrug> findByCriteria(FdaDrugCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<FdaDrug> specification = createSpecification(criteria);
        return fdaDrugRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(FdaDrugCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<FdaDrug> specification = createSpecification(criteria);
        return fdaDrugRepository.count(specification);
    }

    /**
     * Function to convert {@link FdaDrugCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<FdaDrug> createSpecification(FdaDrugCriteria criteria) {
        Specification<FdaDrug> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), FdaDrug_.id));
            }
            if (criteria.getApplicationNumber() != null) {
                specification = specification.or(buildStringSpecification(criteria.getApplicationNumber(), FdaDrug_.applicationNumber));
            }
            if (criteria.getSponsorName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getSponsorName(), FdaDrug_.sponsorName));
            }
            if (criteria.getOverallMarketingStatus() != null) {
                specification = specification.or(
                    buildStringSpecification(criteria.getOverallMarketingStatus(), FdaDrug_.overallMarketingStatus)
                );
            }
            if (criteria.getFdaSubmissionId() != null) {
                specification = specification.or(
                    buildSpecification(
                        criteria.getFdaSubmissionId(),
                        root -> root.join(FdaDrug_.fdaSubmissions, JoinType.LEFT).get(FdaSubmission_.id)
                    )
                );
            }
            if (criteria.getDrugId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getDrugId(), root -> root.join(FdaDrug_.drug, JoinType.LEFT).get(Drug_.id))
                );
            }
        }
        return specification;
    }
}
