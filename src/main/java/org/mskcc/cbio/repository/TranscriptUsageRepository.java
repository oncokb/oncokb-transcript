package org.mskcc.cbio.repository;

import org.mskcc.cbio.domain.TranscriptUsage;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the TranscriptUsage entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptUsageRepository extends JpaRepository<TranscriptUsage, Long> {}
