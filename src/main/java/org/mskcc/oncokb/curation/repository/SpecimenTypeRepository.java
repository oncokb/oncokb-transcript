package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.SpecimenType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the SpecimenType entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SpecimenTypeRepository extends JpaRepository<SpecimenType, Long> {
    Optional<SpecimenType> findOneByType(String type);
}
