package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the GeneAlias entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GeneAliasRepository extends JpaRepository<GeneAlias, Long> {
    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<GeneAlias> findByName(String name);
}
