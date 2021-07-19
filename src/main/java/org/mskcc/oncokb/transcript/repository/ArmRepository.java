package org.mskcc.oncokb.transcript.repository;

import org.mskcc.oncokb.transcript.domain.Arm;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Arm entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArmRepository extends JpaRepository<Arm, Long> {}
