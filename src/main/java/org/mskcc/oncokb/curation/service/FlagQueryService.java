package org.mskcc.oncokb.curation.service;

import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.repository.FlagRepository;
import org.mskcc.oncokb.curation.service.criteria.FlagCriteria;
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
 * Service for executing complex queries for {@link Flag} entities in the database.
 * The main input is a {@link FlagCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Flag} or a {@link Page} of {@link Flag} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class FlagQueryService extends QueryService<Flag> {

    private final Logger log = LoggerFactory.getLogger(FlagQueryService.class);

    private final FlagRepository flagRepository;

    public FlagQueryService(FlagRepository flagRepository) {
        this.flagRepository = flagRepository;
    }

    /**
     * Return a {@link List} of {@link Flag} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Flag> findByCriteria(FlagCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Flag> specification = createSpecification(criteria);
        return flagRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Flag} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Flag> findByCriteria(FlagCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Flag> specification = createSpecification(criteria);
        return flagRepository.findAll(specification, page);
    }

    @Transactional(readOnly = true)
    public Page<Flag> findBySearchQuery(String query, Pageable page) {
        FlagCriteria criteria = new FlagCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setType(stringFilter);
        criteria.setFlag(stringFilter);
        criteria.setName(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(FlagCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Flag> specification = createSpecification(criteria);
        return flagRepository.count(specification);
    }

    /**
     * Function to convert {@link FlagCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Flag> createSpecification(FlagCriteria criteria) {
        Specification<Flag> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Flag_.id));
            }
            if (criteria.getType() != null) {
                specification = specification.or(buildStringSpecification(criteria.getType(), Flag_.type));
            }
            if (criteria.getFlag() != null) {
                specification = specification.or(buildStringSpecification(criteria.getFlag(), Flag_.flag));
            }
            if (criteria.getName() != null) {
                specification = specification.or(buildStringSpecification(criteria.getName(), Flag_.name));
            }
            if (criteria.getAlterationId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getAlterationId(), root -> root.join(Flag_.alterations, JoinType.LEFT).get(Alteration_.id))
                );
            }
            if (criteria.getArticleId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getArticleId(), root -> root.join(Flag_.articles, JoinType.LEFT).get(Article_.id))
                );
            }
            if (criteria.getDrugId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getDrugId(), root -> root.join(Flag_.drugs, JoinType.LEFT).get(Drug_.id))
                );
            }
            if (criteria.getGeneId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getGeneId(), root -> root.join(Flag_.genes, JoinType.LEFT).get(Gene_.id))
                );
            }
            if (criteria.getTranscriptId() != null) {
                specification = specification.or(
                    buildSpecification(criteria.getTranscriptId(), root -> root.join(Flag_.transcripts, JoinType.LEFT).get(Transcript_.id))
                );
            }
        }
        return specification;
    }
}
