package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CategoricalAlteration;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CategoricalAlteration entity.
 */
@JaversSpringDataAuditable
@Repository
public interface CategoricalAlterationRepository extends JpaRepository<CategoricalAlteration, Long> {
    Optional<CategoricalAlteration> findByAlterationTypeAndName(AlterationType alterationType, String name);
    Optional<CategoricalAlteration> findByName(String name);
}
