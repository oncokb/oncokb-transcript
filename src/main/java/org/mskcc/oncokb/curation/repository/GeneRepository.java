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
    Optional<Gene> findByEntrezGeneId(Integer entrezGeneId);

    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<Gene> findByHugoSymbol(String hugoSymbol);

    @Query(
        value = "select gene from Gene gene left join fetch gene.geneAliases ga where UPPER(gene.hugoSymbol) = UPPER(:hugoSymbol) or UPPER(ga.name) = UPPER(:hugoSymbol) "
    )
    List<Gene> findGeneByHugoSymbolOrGeneAliasesIn(@Param("hugoSymbol") String hugoSymbol);

    @Query(value = "select gene.id from Gene gene order by gene.id", countQuery = "select count(gene.id) from Gene gene")
    Page<Long> findAllGeneIds(Pageable pageable);

    @Query(
        value = "select distinct gene from Gene gene left join fetch gene.geneAliases ga left join fetch gene.ensemblGenes eg where gene.id in :ids"
    )
    List<Gene> findAllByIdInWithGeneAliasAndEnsemblGenes(@Param("ids") List<Long> ids);

    @Query(
        value = "select distinct gene from Gene gene left join fetch gene.alterations",
        countQuery = "select count(distinct gene) from Gene gene"
    )
    Page<Gene> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct gene from Gene gene left join fetch gene.alterations")
    List<Gene> findAllWithEagerRelationships();

    @Query("select gene from Gene gene left join fetch gene.alterations where gene.id =:id")
    Optional<Gene> findOneWithEagerRelationships(@Param("id") Long id);

    List<Gene> findByHugoSymbolInIgnoreCase(List<String> values);
}
