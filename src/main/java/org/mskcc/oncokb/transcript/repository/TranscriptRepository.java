package org.mskcc.oncokb.transcript.repository;

import org.mskcc.oncokb.transcript.domain.Transcript;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {}
