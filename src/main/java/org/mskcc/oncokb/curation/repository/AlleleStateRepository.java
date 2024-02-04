package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.AlleleState;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the AlleleState entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AlleleStateRepository extends JpaRepository<AlleleState, Long> {
    Optional<AlleleState> findByName(String name);
}
