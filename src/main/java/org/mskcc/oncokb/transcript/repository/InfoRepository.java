package org.mskcc.oncokb.transcript.repository;

import org.mskcc.oncokb.transcript.domain.Info;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Info entity.
 */
@SuppressWarnings("unused")
@Repository
public interface InfoRepository extends JpaRepository<Info, Long> {}
