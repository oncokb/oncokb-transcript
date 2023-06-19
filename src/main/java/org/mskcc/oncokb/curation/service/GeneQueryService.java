package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.mskcc.oncokb.curation.service.criteria.GeneCriteria;
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
 * Service for executing complex queries for {@link Gene} entities in the database.
 * The main input is a {@link GeneCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Gene} or a {@link Page} of {@link Gene} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class GeneQueryService extends QueryService<Gene> {

    private final Logger log = LoggerFactory.getLogger(GeneQueryService.class);

    private final GeneRepository geneRepository;

    public GeneQueryService(GeneRepository geneRepository) {
        this.geneRepository = geneRepository;
    }

    @Transactional(readOnly = true)
    public Page<Gene> findBySearchQuery(String query, Pageable page) {
        GeneCriteria criteria = new GeneCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setHugoSymbol(stringFilter);
        final Specification<Gene> specification = createSpecification(criteria);
        return geneRepository.findAll(specification, page);
    }

    /**
     * Return a {@link List} of {@link Gene} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Gene> findByCriteria(GeneCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Gene> specification = createSpecification(criteria);
        return geneRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Gene} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Gene> findByCriteria(GeneCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Gene> specification = createSpecification(criteria);
        return geneRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(GeneCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Gene> specification = createSpecification(criteria);
        return geneRepository.count(specification);
    }

    /**
     * Function to convert {@link GeneCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Gene> createSpecification(GeneCriteria criteria) {
        Specification<Gene> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Gene_.id));
            }
            if (criteria.getEntrezGeneId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getEntrezGeneId(), Gene_.entrezGeneId));
            }
            if (criteria.getHugoSymbol() != null) {
                specification = specification.or(buildStringSpecification(criteria.getHugoSymbol(), Gene_.hugoSymbol));
            }
            if (criteria.getGeneAliasId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getGeneAliasId(),
                            root -> root.join(Gene_.geneAliases, JoinType.LEFT).get(GeneAlias_.id)
                        )
                    );
            }
            if (criteria.getEnsemblGeneId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getEnsemblGeneId(),
                            root -> root.join(Gene_.ensemblGenes, JoinType.LEFT).get(EnsemblGene_.id)
                        )
                    );
            }
            if (criteria.getAlterationId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getAlterationId(),
                            root -> root.join(Gene_.alterations, JoinType.LEFT).get(Alteration_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
