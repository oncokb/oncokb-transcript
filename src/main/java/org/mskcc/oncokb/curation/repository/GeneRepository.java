package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Gene;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Gene entity.
 */
@JaversSpringDataAuditable
@Repository
public interface GeneRepository extends JpaRepository<Gene, Long>, JpaSpecificationExecutor<Gene> {
    @Query(
        value = "select distinct gene from Gene gene left join fetch gene.flags left join fetch gene.synonyms",
        countQuery = "select count(distinct gene) from Gene gene"
    )
    Page<Gene> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct gene from Gene gene left join fetch gene.flags left join fetch gene.synonyms")
    List<Gene> findAllWithEagerRelationships();

    @Query("select gene from Gene gene left join fetch gene.flags left join fetch gene.synonyms where gene.id =:id")
    Optional<Gene> findOneWithEagerRelationships(@Param("id") Long id);

    @Cacheable(cacheResolver = "geneCacheResolver")
    @Query(
        "select gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.synonyms" +
        " where gene.entrezGeneId =:entrezGeneId"
    )
    Optional<Gene> findByEntrezGeneId(@Param("entrezGeneId") Integer entrezGeneId);

    @Cacheable(cacheResolver = "geneCacheResolver")
    @Query(
        "select gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.synonyms" +
        " where gene.hugoSymbol =:hugoSymbol"
    )
    Optional<Gene> findByHugoSymbol(@Param("hugoSymbol") String hugoSymbol);

    @Query(
        value = "select gene from Gene gene left join fetch gene.flags left join fetch gene.synonyms ga where UPPER(gene.hugoSymbol) = UPPER(:hugoSymbol) or UPPER(ga.name) = UPPER(:hugoSymbol) "
    )
    List<Gene> findGeneByHugoSymbolOrGeneAliasesIn(@Param("hugoSymbol") String hugoSymbol);

    @Query(
        value = "select distinct gene from Gene gene left join fetch gene.flags left join fetch gene.synonyms ga left join fetch gene.ensemblGenes eg where gene.id in :ids"
    )
    List<Gene> findAllByIdInWithGeneAliasAndEnsemblGenes(@Param("ids") List<Long> ids);

    @Query(
        "select distinct gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.synonyms" +
        " where gene.id in (:ids)"
    )
    List<Gene> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    @Query(
        "select distinct gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.synonyms" +
        " where gene.hugoSymbol in (:symbols)"
    )
    List<Gene> findByHugoSymbolInIgnoreCase(@Param("symbols") List<String> symbols);

    @Query(
        value = "select * from (" +
        "(select * from Gene gene where gene.hugo_symbol ='apc')" +
        " union (select * from Gene gene where lower(gene.hugo_symbol) like lower('%apc%'))" +
        ") as t3",
        nativeQuery = true
    )
    Page<Gene> blurSearchByHugoSymbol(@Param("query") String query, Pageable pageable);
}
