package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.DrugPriority;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DrugPriority entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DrugPriorityRepository extends JpaRepository<DrugPriority, Long> {}
