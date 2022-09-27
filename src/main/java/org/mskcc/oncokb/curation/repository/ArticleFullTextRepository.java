package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the ArticleFullText entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArticleFullTextRepository extends JpaRepository<ArticleFullText, Long> {
    Optional<ArticleFullText> findByArticle(Article article);
}
