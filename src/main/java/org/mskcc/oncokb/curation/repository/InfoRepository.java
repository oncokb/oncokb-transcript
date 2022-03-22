package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Info;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Info entity.
 */
@SuppressWarnings("unused")
@Repository
public interface InfoRepository extends JpaRepository<Info, Long> {
    Optional<Info> findOneByType(InfoType type);
}
