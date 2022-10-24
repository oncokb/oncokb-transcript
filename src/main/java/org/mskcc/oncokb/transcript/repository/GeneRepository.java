package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Gene;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Gene entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GeneRepository extends JpaRepository<Gene, Long> {
    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<Gene> findByEntrezGeneId(Integer entrezGeneId);

    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<Gene> findByHugoSymbol(String hugoSymbol);

    @Query("select distinct g from Gene g left join fetch g.geneAliases ga left join fetch g.ensemblGenes eg")
    List<Gene> findAllWithGeneAliasAndEnsemblGenes();
}
