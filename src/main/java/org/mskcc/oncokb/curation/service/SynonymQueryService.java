package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.repository.SynonymRepository;
import org.mskcc.oncokb.curation.service.criteria.SynonymCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Synonym} entities in the database.
 * The main input is a {@link SynonymCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Synonym} or a {@link Page} of {@link Synonym} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SynonymQueryService extends QueryService<Synonym> {

    private final Logger log = LoggerFactory.getLogger(SynonymQueryService.class);

    private final SynonymRepository synonymRepository;

    public SynonymQueryService(SynonymRepository synonymRepository) {
        this.synonymRepository = synonymRepository;
    }

    /**
     * Return a {@link List} of {@link Synonym} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Synonym> findByCriteria(SynonymCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Synonym> specification = createSpecification(criteria);
        return synonymRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Synonym} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Synonym> findByCriteria(SynonymCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Synonym> specification = createSpecification(criteria);
        return synonymRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SynonymCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Synonym> specification = createSpecification(criteria);
        return synonymRepository.count(specification);
    }

    /**
     * Function to convert {@link SynonymCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Synonym> createSpecification(SynonymCriteria criteria) {
        Specification<Synonym> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Synonym_.id));
            }
            if (criteria.getType() != null) {
                specification = specification.or(buildStringSpecification(criteria.getType(), Synonym_.type));
            }
            if (criteria.getSource() != null) {
                specification = specification.or(buildStringSpecification(criteria.getSource(), Synonym_.source));
            }
            if (criteria.getCode() != null) {
                specification = specification.or(buildStringSpecification(criteria.getCode(), Synonym_.code));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), Synonym_.name));
            }
            if (criteria.getCancerTypeId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getCancerTypeId(),
                            root -> root.join(Synonym_.cancerTypes, JoinType.LEFT).get(CancerType_.id)
                        )
                    );
            }
            if (criteria.getGeneId() != null) {
                specification =
                    specification.or(
                        buildSpecification(criteria.getGeneId(), root -> root.join(Synonym_.genes, JoinType.LEFT).get(Gene_.id))
                    );
            }
            if (criteria.getNciThesaurusId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getNciThesaurusId(),
                            root -> root.join(Synonym_.nciThesauruses, JoinType.LEFT).get(NciThesaurus_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
