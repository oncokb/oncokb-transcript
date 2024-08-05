package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Consequence entity.
 */
@JaversSpringDataAuditable
@Repository
public interface ConsequenceRepository extends JpaRepository<Consequence, Long>, JpaSpecificationExecutor<Consequence> {
    Optional<Consequence> findByTerm(String term);
}
