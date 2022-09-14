package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the ArticleFullText entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArticleFullTextRepository extends JpaRepository<ArticleFullText, Long> {}
