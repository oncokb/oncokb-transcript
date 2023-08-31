package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the SeqRegion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SeqRegionRepository extends JpaRepository<SeqRegion, Long> {
    Optional<SeqRegion> findByName(String name);
}
