package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Flag;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Flag entity.
 */
@JaversSpringDataAuditable
@Repository
public interface FlagRepository extends JpaRepository<Flag, Long>, JpaSpecificationExecutor<Flag> {
    Optional<Flag> findByTypeAndFlag(String type, String flag);

    List<Flag> findAllByFlagIn(List<String> flags);
}
