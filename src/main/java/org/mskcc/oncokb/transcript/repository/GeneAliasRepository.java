package org.mskcc.oncokb.transcript.repository;

import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.GeneAlias;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the GeneAlias entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GeneAliasRepository extends JpaRepository<GeneAlias, Long> {
    Optional<GeneAlias> findByName(String name);
}
