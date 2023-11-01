package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Consequence entity.
 */
@Repository
public interface ConsequenceRepository extends JpaRepository<Consequence, Long>, JpaSpecificationExecutor<Consequence> {
    Optional<Consequence> findConsequenceByTerm(String term);
}
