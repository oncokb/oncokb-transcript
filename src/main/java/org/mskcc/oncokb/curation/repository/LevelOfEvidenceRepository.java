package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the LevelOfEvidence entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LevelOfEvidenceRepository extends JpaRepository<LevelOfEvidence, Long> {}
