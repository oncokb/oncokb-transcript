package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
import org.mskcc.oncokb.curation.service.criteria.ArticleCriteria;
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
 * Service for executing complex queries for {@link Article} entities in the database.
 * The main input is a {@link ArticleCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link Article} or a {@link Page} of {@link Article} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ArticleQueryService extends QueryService<Article> {

    private final Logger log = LoggerFactory.getLogger(ArticleQueryService.class);

    private final ArticleRepository articleRepository;

    public ArticleQueryService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public Page<Article> findBySearchQuery(String query, Pageable page) {
        ArticleCriteria criteria = new ArticleCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setPmid(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return a {@link List} of {@link Article} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<Article> findByCriteria(ArticleCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Article> specification = createSpecification(criteria);
        return articleRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link Article} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Article> findByCriteria(ArticleCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Article> specification = createSpecification(criteria);
        return articleRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ArticleCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Article> specification = createSpecification(criteria);
        return articleRepository.count(specification);
    }

    /**
     * Function to convert {@link ArticleCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Article> createSpecification(ArticleCriteria criteria) {
        Specification<Article> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Article_.id));
            }
            if (criteria.getPmid() != null) {
                specification = specification.or(buildStringSpecification(criteria.getPmid(), Article_.pmid));
            }
            if (criteria.getJournal() != null) {
                specification = specification.or(buildStringSpecification(criteria.getJournal(), Article_.journal));
            }
            if (criteria.getPubDate() != null) {
                specification = specification.or(buildStringSpecification(criteria.getPubDate(), Article_.pubDate));
            }
            if (criteria.getVolume() != null) {
                specification = specification.or(buildStringSpecification(criteria.getVolume(), Article_.volume));
            }
            if (criteria.getIssue() != null) {
                specification = specification.or(buildStringSpecification(criteria.getIssue(), Article_.issue));
            }
            if (criteria.getPages() != null) {
                specification = specification.or(buildStringSpecification(criteria.getPages(), Article_.pages));
            }
            if (criteria.getAuthors() != null) {
                specification = specification.or(buildStringSpecification(criteria.getAuthors(), Article_.authors));
            }
        }
        return specification;
    }
}
