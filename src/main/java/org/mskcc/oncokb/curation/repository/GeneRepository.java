package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Gene;
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
}
