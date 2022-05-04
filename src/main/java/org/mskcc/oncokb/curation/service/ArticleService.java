package org.mskcc.oncokb.curation.service;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
import org.mskcc.oncokb.curation.repository.search.ArticleSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Article}.
 */
@Service
@Transactional
public class ArticleService {

    private final Logger log = LoggerFactory.getLogger(ArticleService.class);

    private final ArticleRepository articleRepository;

    private final ArticleSearchRepository articleSearchRepository;

    public ArticleService(ArticleRepository articleRepository, ArticleSearchRepository articleSearchRepository) {
        this.articleRepository = articleRepository;
        this.articleSearchRepository = articleSearchRepository;
    }

    /**
     * Save a article.
     *
     * @param article the entity to save.
     * @return the persisted entity.
     */
    public Article save(Article article) {
        log.debug("Request to save Article : {}", article);
        Article result = articleRepository.save(article);
        articleSearchRepository.save(result);
        return result;
    }

    /**
     * Partially update a article.
     *
     * @param article the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Article> partialUpdate(Article article) {
        log.debug("Request to partially update Article : {}", article);

        return articleRepository
            .findById(article.getId())
            .map(existingArticle -> {
                if (article.getPmid() != null) {
                    existingArticle.setPmid(article.getPmid());
                }
                if (article.getTitle() != null) {
                    existingArticle.setTitle(article.getTitle());
                }
                if (article.getJournal() != null) {
                    existingArticle.setJournal(article.getJournal());
                }
                if (article.getPubDate() != null) {
                    existingArticle.setPubDate(article.getPubDate());
                }
                if (article.getVolume() != null) {
                    existingArticle.setVolume(article.getVolume());
                }
                if (article.getIssue() != null) {
                    existingArticle.setIssue(article.getIssue());
                }
                if (article.getPages() != null) {
                    existingArticle.setPages(article.getPages());
                }
                if (article.getAuthors() != null) {
                    existingArticle.setAuthors(article.getAuthors());
                }

                return existingArticle;
            })
            .map(articleRepository::save)
            .map(savedArticle -> {
                articleSearchRepository.save(savedArticle);

                return savedArticle;
            });
    }

    /**
     * Get all the articles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Article> findAll(Pageable pageable) {
        log.debug("Request to get all Articles");
        return articleRepository.findAll(pageable);
    }

    /**
     * Get one article by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Article> findOne(Long id) {
        log.debug("Request to get Article : {}", id);
        return articleRepository.findById(id);
    }

    /**
     * Delete the article by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Article : {}", id);
        articleRepository.deleteById(id);
        articleSearchRepository.deleteById(id);
    }

    /**
     * Search for the article corresponding to the query.
     *
     * @param query the query of the search.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Article> search(String query, Pageable pageable) {
        log.debug("Request to search for a page of Articles for query {}", query);
        return articleSearchRepository.search(query, pageable);
    }
}
