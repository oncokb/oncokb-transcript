package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.repository.CompanionDiagnosticDeviceRepository;
import org.mskcc.oncokb.curation.service.criteria.CompanionDiagnosticDeviceCriteria;
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
 * Service for executing complex queries for {@link CompanionDiagnosticDevice} entities in the database.
 * The main input is a {@link CompanionDiagnosticDeviceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link CompanionDiagnosticDevice} or a {@link Page} of {@link CompanionDiagnosticDevice} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class CompanionDiagnosticDeviceQueryService extends QueryService<CompanionDiagnosticDevice> {

    private final Logger log = LoggerFactory.getLogger(CompanionDiagnosticDeviceQueryService.class);

    private final CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;

    public CompanionDiagnosticDeviceQueryService(CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository) {
        this.companionDiagnosticDeviceRepository = companionDiagnosticDeviceRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanionDiagnosticDevice> findBySearchQuery(String query) {
        return findBySearchQuery(query, Pageable.unpaged()).getContent();
    }

    @Transactional(readOnly = true)
    public Page<CompanionDiagnosticDevice> findBySearchQuery(String query, Pageable page) {
        CompanionDiagnosticDeviceCriteria criteria = new CompanionDiagnosticDeviceCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setName(stringFilter);
        criteria.setManufacturer(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return a {@link List} of {@link CompanionDiagnosticDevice} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<CompanionDiagnosticDevice> findByCriteria(CompanionDiagnosticDeviceCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<CompanionDiagnosticDevice> specification = createSpecification(criteria);
        return companionDiagnosticDeviceRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link CompanionDiagnosticDevice} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<CompanionDiagnosticDevice> findByCriteria(CompanionDiagnosticDeviceCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<CompanionDiagnosticDevice> specification = createSpecification(criteria);
        return companionDiagnosticDeviceRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(CompanionDiagnosticDeviceCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<CompanionDiagnosticDevice> specification = createSpecification(criteria);
        return companionDiagnosticDeviceRepository.count(specification);
    }

    /**
     * Function to convert {@link CompanionDiagnosticDeviceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<CompanionDiagnosticDevice> createSpecification(CompanionDiagnosticDeviceCriteria criteria) {
        Specification<CompanionDiagnosticDevice> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), CompanionDiagnosticDevice_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), CompanionDiagnosticDevice_.name));
            }
            if (criteria.getManufacturer() != null) {
                specification =
                    specification.or(buildStringSpecification(criteria.getManufacturer(), CompanionDiagnosticDevice_.manufacturer));
            }
            if (criteria.getFdaSubmissionId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getFdaSubmissionId(),
                            root -> root.join(CompanionDiagnosticDevice_.fdaSubmissions, JoinType.LEFT).get(FdaSubmission_.id)
                        )
                    );
            }
            if (criteria.getSpecimenTypeId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getSpecimenTypeId(),
                            root -> root.join(CompanionDiagnosticDevice_.specimenTypes, JoinType.LEFT).get(SpecimenType_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
