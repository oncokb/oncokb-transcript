package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Consequence entity.
 */
@JaversSpringDataAuditable
@Repository
public interface ConsequenceRepository extends JpaRepository<Consequence, Long>, JpaSpecificationExecutor<Consequence> {
    Optional<Consequence> findConsequenceByAlterationTypeAndTerm(AlterationType alterationType, String term);
}
