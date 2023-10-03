package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.AlterationReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the AlterationReferenceGenome entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AlterationReferenceGenomeRepository extends JpaRepository<AlterationReferenceGenome, Long> {}
