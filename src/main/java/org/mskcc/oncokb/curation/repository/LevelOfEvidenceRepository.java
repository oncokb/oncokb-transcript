package org.mskcc.oncokb.curation.repository;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the LevelOfEvidence entity.
 */
@JaversSpringDataAuditable
@Repository
public interface LevelOfEvidenceRepository extends JpaRepository<LevelOfEvidence, Long> {}
