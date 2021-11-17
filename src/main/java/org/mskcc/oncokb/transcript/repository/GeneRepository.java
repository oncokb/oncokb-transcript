package org.mskcc.oncokb.transcript.repository;

import org.mskcc.oncokb.transcript.domain.Gene;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Gene entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GeneRepository extends JpaRepository<Gene, Long> {}
