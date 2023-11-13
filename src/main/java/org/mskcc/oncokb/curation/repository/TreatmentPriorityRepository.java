package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.TreatmentPriority;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the TreatmentPriority entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TreatmentPriorityRepository extends JpaRepository<TreatmentPriority, Long> {}
