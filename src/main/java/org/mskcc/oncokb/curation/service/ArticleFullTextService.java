package org.mskcc.oncokb.curation.service;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.mskcc.oncokb.curation.repository.ArticleFullTextRepository;
import org.mskcc.oncokb.curation.repository.search.ArticleFullTextSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link ArticleFullText}.
 */
@Service
@Transactional
public class ArticleFullTextService {

    private final Logger log = LoggerFactory.getLogger(ArticleFullTextService.class);

    private final ArticleFullTextRepository articleFullTextRepository;

    private final ArticleFullTextSearchRepository articleFullTextSearchRepository;

    public ArticleFullTextService(
        ArticleFullTextRepository articleFullTextRepository,
        ArticleFullTextSearchRepository articleFullTextSearchRepository
    ) {
        this.articleFullTextRepository = articleFullTextRepository;
        this.articleFullTextSearchRepository = articleFullTextSearchRepository;
    }

    /**
     * Save a articleFullText.
     *
     * @param articleFullText the entity to save.
     * @return the persisted entity.
     */
    public ArticleFullText save(ArticleFullText articleFullText) {
        log.debug("Request to save ArticleFullText : {}", articleFullText);
        ArticleFullText result = articleFullTextRepository.save(articleFullText);
        articleFullTextSearchRepository.save(result);
        return result;
    }

    /**
     * Partially update a articleFullText.
     *
     * @param articleFullText the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ArticleFullText> partialUpdate(ArticleFullText articleFullText) {
        log.debug("Request to partially update ArticleFullText : {}", articleFullText);

        return articleFullTextRepository
            .findById(articleFullText.getId())
            .map(existingArticleFullText -> {
                if (articleFullText.getText() != null) {
                    existingArticleFullText.setText(articleFullText.getText());
                }
                if (articleFullText.getHtml() != null) {
                    existingArticleFullText.setHtml(articleFullText.getHtml());
                }

                return existingArticleFullText;
            })
            .map(articleFullTextRepository::save)
            .map(savedArticleFullText -> {
                articleFullTextSearchRepository.save(savedArticleFullText);

                return savedArticleFullText;
            });
    }

    /**
     * Get all the articleFullTexts.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<ArticleFullText> findAll() {
        log.debug("Request to get all ArticleFullTexts");
        return articleFullTextRepository.findAll();
    }

    /**
     * Get one articleFullText by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ArticleFullText> findOne(Long id) {
        log.debug("Request to get ArticleFullText : {}", id);
        return articleFullTextRepository.findById(id);
    }

    /**
     * Delete the articleFullText by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete ArticleFullText : {}", id);
        articleFullTextRepository.deleteById(id);
        articleFullTextSearchRepository.deleteById(id);
    }

    /**
     * Search for the articleFullText corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<ArticleFullText> search(String query) {
        log.debug("Request to search ArticleFullTexts for query {}", query);
        return StreamSupport.stream(articleFullTextSearchRepository.search(query).spliterator(), false).collect(Collectors.toList());
    }
}
