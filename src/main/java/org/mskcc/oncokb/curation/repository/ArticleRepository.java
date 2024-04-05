package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Article entity.
 */
@JaversSpringDataAuditable
@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {
    @Query(
        value = "select distinct article from Article article left join fetch article.flags left join fetch article.synonyms",
        countQuery = "select count(distinct article) from Article article"
    )
    Page<Article> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct article from Article article left join fetch article.flags left join fetch article.synonyms")
    List<Article> findAllWithEagerRelationships();

    @Query("select article from Article article left join fetch article.flags left join fetch article.synonyms where article.id =:id")
    Optional<Article> findOneWithEagerRelationships(@Param("id") Long id);

    Optional<Article> findByContent(@Param("content") String content);

    Optional<Article> findByLink(@Param("link") String link);

    Optional<Article> findByTypeAndUid(@Param("type") String type, @Param("uid") String uid);
}
