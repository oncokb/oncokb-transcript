package org.mskcc.oncokb.transcript.repository;

import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the TranscriptUsage entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptUsageRepository extends JpaRepository<TranscriptUsage, Long> {}
