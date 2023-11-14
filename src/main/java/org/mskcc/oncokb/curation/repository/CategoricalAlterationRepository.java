package org.mskcc.oncokb.curation.repository;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CategoricalAlteration;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CategoricalAlteration entity.
 */
@JaversSpringDataAuditable
@Repository
public interface CategoricalAlterationRepository extends JpaRepository<CategoricalAlteration, Long> {}
