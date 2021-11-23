package org.mskcc.oncokb.transcript.repository;

import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Sequence;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Sequence entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SequenceRepository extends JpaRepository<Sequence, Long> {
    Optional<Sequence> findOneByTranscriptAndSequenceType(Transcript transcript, SequenceType sequenceType);
}
