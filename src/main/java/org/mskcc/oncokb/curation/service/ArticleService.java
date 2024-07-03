package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
import org.mskcc.oncokb.curation.service.dto.pubmed.PubMedDTO;
import org.mskcc.oncokb.curation.service.mapper.PubMedMapper;
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
    private final NihEutilsService nihEutilsService;
    private final PubMedMapper pubMedMapper;

    public ArticleService(ArticleRepository articleRepository, NihEutilsService nihEutilsService, PubMedMapper pubMedMapper) {
        this.articleRepository = articleRepository;
        this.nihEutilsService = nihEutilsService;
        this.pubMedMapper = pubMedMapper;
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
                if (article.getType() != null) {
                    existingArticle.setType(article.getType());
                }
                if (article.getUid() != null) {
                    existingArticle.setUid(article.getUid());
                }
                if (article.getTitle() != null) {
                    existingArticle.setTitle(article.getTitle());
                }
                if (article.getContent() != null) {
                    existingArticle.setContent(article.getContent());
                }
                if (article.getLink() != null) {
                    existingArticle.setLink(article.getLink());
                }
                if (article.getAuthors() != null) {
                    existingArticle.setAuthors(article.getAuthors());
                }
                if (article.getDate() != null) {
                    existingArticle.setDate(article.getDate());
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

    @Transactional(readOnly = true)
    public Optional<Article> findByContent(String content) {
        log.debug("Request to get Article : {}", content);
        return articleRepository.findByContent(content);
    }

    @Transactional(readOnly = true)
    public Optional<Article> findByLink(String link) {
        log.debug("Request to get Article : {}", link);
        return articleRepository.findByLink(link);
    }

    @Transactional(readOnly = true)
    public Optional<Article> findByPmid(String pmid) {
        log.debug("Request to get Article by PMID : {}", pmid);
        return findByTypeAndUid(ArticleType.PUBMED, pmid);
    }

    @Transactional(readOnly = true)
    public Optional<Article> findByTypeAndUid(ArticleType articleType, String uid) {
        log.debug("Request to get Article : {} {}", articleType, uid);
        return articleRepository.findByTypeAndUid(articleType, uid);
    }

    /**
     * Get all the articles with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Article> findAllWithEagerRelationships(Pageable pageable) {
        return articleRepository.findAllWithEagerRelationships(pageable);
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
        return articleRepository.findOneWithEagerRelationships(id);
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

    public Article fetchAndSavePubMed(String pmid) {
        PubMedDTO pubMedDTO = nihEutilsService.fetchPubmedArticle(pmid);
        // We would like to retry if there is no data returned. Eutils sometime has glitch returning empty result but usually resolved in second try.
        if (pubMedDTO == null) {
            pubMedDTO = nihEutilsService.fetchPubmedArticle(pmid);
        }
        if (pubMedDTO == null) {
            log.error("No PubMed info found for {}", pmid);
            return null;
        } else {
            return this.save(pubMedMapper.pubMedDTOToArticle(pubMedDTO));
        }
    }
}
