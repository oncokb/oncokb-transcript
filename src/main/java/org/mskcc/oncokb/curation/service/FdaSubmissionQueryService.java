package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.mskcc.oncokb.curation.service.criteria.FdaSubmissionCriteria;
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
 * Service for executing complex queries for {@link FdaSubmission} entities in the database.
 * The main input is a {@link FdaSubmissionCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link FdaSubmission} or a {@link Page} of {@link FdaSubmission} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class FdaSubmissionQueryService extends QueryService<FdaSubmission> {

    private final Logger log = LoggerFactory.getLogger(FdaSubmissionQueryService.class);

    private final FdaSubmissionRepository fdaSubmissionRepository;

    public FdaSubmissionQueryService(FdaSubmissionRepository fdaSubmissionRepository) {
        this.fdaSubmissionRepository = fdaSubmissionRepository;
    }

    @Transactional(readOnly = true)
    public Page<FdaSubmission> findBySearchQuery(String query, Pageable page) {
        FdaSubmissionCriteria criteria = new FdaSubmissionCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setDeviceName(stringFilter);
        criteria.setNumber(stringFilter);
        criteria.setSupplementNumber(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return a {@link List} of {@link FdaSubmission} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<FdaSubmission> findByCriteria(FdaSubmissionCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<FdaSubmission> specification = createSpecification(criteria);
        return fdaSubmissionRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link FdaSubmission} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<FdaSubmission> findByCriteria(FdaSubmissionCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<FdaSubmission> specification = createSpecification(criteria);
        return fdaSubmissionRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(FdaSubmissionCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<FdaSubmission> specification = createSpecification(criteria);
        return fdaSubmissionRepository.count(specification);
    }

    /**
     * Function to convert {@link FdaSubmissionCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<FdaSubmission> createSpecification(FdaSubmissionCriteria criteria) {
        Specification<FdaSubmission> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), FdaSubmission_.id));
            }
            if (criteria.getNumber() != null) {
                specification = specification.or(buildStringSpecification(criteria.getNumber(), FdaSubmission_.number));
            }
            if (criteria.getSupplementNumber() != null) {
                specification = specification.or(buildStringSpecification(criteria.getSupplementNumber(), FdaSubmission_.supplementNumber));
            }
            if (criteria.getDeviceName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getDeviceName(), FdaSubmission_.deviceName));
            }
            if (criteria.getGenericName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getGenericName(), FdaSubmission_.genericName));
            }
            if (criteria.getDateReceived() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getDateReceived(), FdaSubmission_.dateReceived));
            }
            if (criteria.getDecisionDate() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getDecisionDate(), FdaSubmission_.decisionDate));
            }
            if (criteria.getCurated() != null) {
                specification = specification.or(buildSpecification(criteria.getCurated(), FdaSubmission_.curated));
            }
            if (criteria.getGenetic() != null) {
                specification = specification.or(buildSpecification(criteria.getGenetic(), FdaSubmission_.genetic));
            }
            if (criteria.getDeviceUsageIndicationId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getDeviceUsageIndicationId(),
                            root -> root.join(FdaSubmission_.deviceUsageIndications, JoinType.LEFT).get(DeviceUsageIndication_.id)
                        )
                    );
            }
            if (criteria.getCompanionDiagnosticDeviceId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getCompanionDiagnosticDeviceId(),
                            root -> root.join(FdaSubmission_.companionDiagnosticDevice, JoinType.LEFT).get(CompanionDiagnosticDevice_.id)
                        )
                    );
            }
            if (criteria.getTypeId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getTypeId(),
                            root -> root.join(FdaSubmission_.type, JoinType.LEFT).get(FdaSubmissionType_.id)
                        )
                    );
            }
            if (criteria.getTypeName() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getTypeName(),
                            root -> root.join(FdaSubmission_.type, JoinType.LEFT).get(FdaSubmissionType_.name)
                        )
                    );
            }
        }
        return specification;
    }
}
