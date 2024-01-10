package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.repository.DrugBrandRepository;
import org.mskcc.oncokb.curation.service.criteria.DrugBrandCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link DrugBrand} entities in the database.
 * The main input is a {@link DrugBrandCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link DrugBrand} or a {@link Page} of {@link DrugBrand} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class DrugBrandQueryService extends QueryService<DrugBrand> {

    private final Logger log = LoggerFactory.getLogger(DrugBrandQueryService.class);

    private final DrugBrandRepository drugBrandRepository;

    public DrugBrandQueryService(DrugBrandRepository drugBrandRepository) {
        this.drugBrandRepository = drugBrandRepository;
    }

    /**
     * Return a {@link List} of {@link DrugBrand} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<DrugBrand> findByCriteria(DrugBrandCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<DrugBrand> specification = createSpecification(criteria);
        return drugBrandRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link DrugBrand} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<DrugBrand> findByCriteria(DrugBrandCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<DrugBrand> specification = createSpecification(criteria);
        return drugBrandRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(DrugBrandCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<DrugBrand> specification = createSpecification(criteria);
        return drugBrandRepository.count(specification);
    }

    /**
     * Function to convert {@link DrugBrandCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<DrugBrand> createSpecification(DrugBrandCriteria criteria) {
        Specification<DrugBrand> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), DrugBrand_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.and(buildStringSpecification(criteria.getName(), DrugBrand_.name));
            }
            if (criteria.getRegion() != null) {
                specification = specification.and(buildStringSpecification(criteria.getRegion(), DrugBrand_.region));
            }
            if (criteria.getDrugId() != null) {
                specification =
                    specification.and(
                        buildSpecification(criteria.getDrugId(), root -> root.join(DrugBrand_.drug, JoinType.LEFT).get(Drug_.id))
                    );
            }
        }
        return specification;
    }
}
