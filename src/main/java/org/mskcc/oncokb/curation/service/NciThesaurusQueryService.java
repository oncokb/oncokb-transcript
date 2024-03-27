package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.repository.NciThesaurusRepository;
import org.mskcc.oncokb.curation.service.criteria.NciThesaurusCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link NciThesaurus} entities in the database.
 * The main input is a {@link NciThesaurusCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link NciThesaurus} or a {@link Page} of {@link NciThesaurus} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class NciThesaurusQueryService extends QueryService<NciThesaurus> {

    private final Logger log = LoggerFactory.getLogger(NciThesaurusQueryService.class);

    private final NciThesaurusRepository nciThesaurusRepository;

    public NciThesaurusQueryService(NciThesaurusRepository nciThesaurusRepository) {
        this.nciThesaurusRepository = nciThesaurusRepository;
    }

    /**
     * Return a {@link List} of {@link NciThesaurus} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<NciThesaurus> findByCriteria(NciThesaurusCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<NciThesaurus> specification = createSpecification(criteria);
        return nciThesaurusRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link NciThesaurus} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<NciThesaurus> findByCriteria(NciThesaurusCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<NciThesaurus> specification = createSpecification(criteria);
        return nciThesaurusRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(NciThesaurusCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<NciThesaurus> specification = createSpecification(criteria);
        return nciThesaurusRepository.count(specification);
    }

    /**
     * Function to convert {@link NciThesaurusCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<NciThesaurus> createSpecification(NciThesaurusCriteria criteria) {
        Specification<NciThesaurus> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), NciThesaurus_.id));
            }
            if (criteria.getVersion() != null) {
                specification = specification.or(buildStringSpecification(criteria.getVersion(), NciThesaurus_.version));
            }
            if (criteria.getCode() != null) {
                specification = specification.or(buildStringSpecification(criteria.getCode(), NciThesaurus_.code));
            }
            if (criteria.getPreferredName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getPreferredName(), NciThesaurus_.preferredName));
            }
            if (criteria.getDisplayName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getDisplayName(), NciThesaurus_.displayName));
            }
            if (criteria.getSynonymId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getSynonymId(),
                            root -> root.join(NciThesaurus_.synonyms, JoinType.LEFT).get(Synonym_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
