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

    @Query("select distinct g from Gene g left join fetch g.geneAliases ga left join fetch g.ensemblGenes eg")
    Page<Gene> findAllWithGeneAliasAndEnsemblGenes(Pageable pageable);

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
