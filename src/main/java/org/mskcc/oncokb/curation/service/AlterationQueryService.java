package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.service.criteria.AlterationCriteria;
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
 * Service for executing complex queries for {@link Alteration} entities in the database.
 * The main input is a {@link AlterationCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Alteration} or a {@link Page} of {@link Alteration} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AlterationQueryService extends QueryService<Alteration> {

    private final Logger log = LoggerFactory.getLogger(AlterationQueryService.class);

    private final AlterationRepository alterationRepository;

    public AlterationQueryService(AlterationRepository alterationRepository) {
        this.alterationRepository = alterationRepository;
    }

    @Transactional(readOnly = true)
    public Page<Alteration> findBySearchQuery(String query, Pageable page) {
        AlterationCriteria criteria = new AlterationCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setName(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return a {@link List} of {@link Alteration} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Alteration> findByCriteria(AlterationCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Alteration> specification = createSpecification(criteria);
        return alterationRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Alteration} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Alteration> findByCriteria(AlterationCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Alteration> specification = createSpecification(criteria);
        return alterationRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(AlterationCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Alteration> specification = createSpecification(criteria);
        return alterationRepository.count(specification);
    }

    /**
     * Function to convert {@link AlterationCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Alteration> createSpecification(AlterationCriteria criteria) {
        Specification<Alteration> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Alteration_.id));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), Alteration_.name));
            }
            if (criteria.getAlteration() != null) {
                specification = specification.or(buildStringSpecification(criteria.getAlteration(), Alteration_.alteration));
            }
            if (criteria.getProteinStart() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getProteinStart(), Alteration_.proteinStart));
            }
            if (criteria.getProteinEnd() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getProteinEnd(), Alteration_.proteinEnd));
            }
            if (criteria.getRefResidues() != null) {
                specification = specification.or(buildStringSpecification(criteria.getRefResidues(), Alteration_.refResidues));
            }
            if (criteria.getVariantResidues() != null) {
                specification = specification.or(buildStringSpecification(criteria.getVariantResidues(), Alteration_.variantResidues));
            }
            if (criteria.getBiomarkerAssociationId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getBiomarkerAssociationId(),
                            root -> root.join(Alteration_.biomarkerAssociations, JoinType.LEFT).get(BiomarkerAssociation_.id)
                        )
                    );
            }
            if (criteria.getReferenceGenomesId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getReferenceGenomesId(),
                            root -> root.join(Alteration_.referenceGenomes, JoinType.LEFT).get(AlterationReferenceGenome_.id)
                        )
                    );
            }
            if (criteria.getGeneId() != null) {
                specification =
                    specification.or(
                        buildSpecification(criteria.getGeneId(), root -> root.join(Alteration_.genes, JoinType.LEFT).get(Gene_.id))
                    );
            }
            if (criteria.getConsequenceId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getConsequenceId(),
                            root -> root.join(Alteration_.consequence, JoinType.LEFT).get(Consequence_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
