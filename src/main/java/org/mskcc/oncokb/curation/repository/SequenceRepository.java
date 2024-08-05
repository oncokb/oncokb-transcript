package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Sequence entity.
 */
@Repository
public interface SequenceRepository extends JpaRepository<Sequence, Long>, JpaSpecificationExecutor<Sequence> {
    Optional<Sequence> findOneByTranscriptAndSequenceType(Transcript transcript, SequenceType sequenceType);
}
