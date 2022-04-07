package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
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

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    /**
     * Save a article.
     *
     * @param article the entity to save.
     * @return the persisted entity.
     */
    public Article save(Article article) {
        log.debug("Request to save Article : {}", article);
        return articleRepository.save(article);
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
            .map(articleRepository::save);
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
    }
}
