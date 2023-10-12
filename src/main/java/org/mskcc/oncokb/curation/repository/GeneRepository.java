package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
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
@Repository
public interface GeneRepository extends JpaRepository<Gene, Long>, JpaSpecificationExecutor<Gene> {
    @Cacheable(cacheResolver = "geneCacheResolver")
    @Query(
        "select gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.geneAliases" +
        " where gene.entrezGeneId =:entrezGeneId"
    )
    Optional<Gene> findByEntrezGeneId(@Param("entrezGeneId") Integer entrezGeneId);

    @Cacheable(cacheResolver = "geneCacheResolver")
    @Query(
        "select gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.geneAliases" +
        " where gene.hugoSymbol =:hugoSymbol"
    )
    Optional<Gene> findByHugoSymbol(@Param("hugoSymbol") String hugoSymbol);

    @Query(
        value = "select gene from Gene gene left join fetch gene.flags left join fetch gene.geneAliases ga where UPPER(gene.hugoSymbol) = UPPER(:hugoSymbol) or UPPER(ga.name) = UPPER(:hugoSymbol) "
    )
    List<Gene> findGeneByHugoSymbolOrGeneAliasesIn(@Param("hugoSymbol") String hugoSymbol);

    @Query(
        value = "select distinct gene from Gene gene left join fetch gene.flags left join fetch gene.geneAliases ga left join fetch gene.ensemblGenes eg where gene.id in :ids"
    )
    List<Gene> findAllByIdInWithGeneAliasAndEnsemblGenes(@Param("ids") List<Long> ids);

    @Query("select distinct gene from Gene gene" + " left join fetch gene.flags" + " left join fetch gene.geneAliases")
    List<Gene> findAllWithEagerRelationships();

    @Query(
        "select distinct gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.geneAliases" +
        " where gene.id in (:ids)"
    )
    List<Gene> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    @Query("select gene from Gene gene" + " left join fetch gene.flags" + " left join fetch gene.geneAliases" + " where gene.id =:id")
    Optional<Gene> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select distinct gene from Gene gene" +
        " left join fetch gene.flags" +
        " left join fetch gene.geneAliases" +
        " where gene.hugoSymbol in (:symbols)"
    )
    List<Gene> findByHugoSymbolInIgnoreCase(@Param("symbols") List<String> symbols);

    @Query("select distinct gene from Gene gene" + " where lower(gene.hugoSymbol) like lower(concat('%', :query,'%'))")
    Page<Gene> searchGene(@Param("query") String query, Pageable pageable);
}
