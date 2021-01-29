package org.mskcc.cbio.repository;

import java.util.Optional;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Sequence entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SequenceRepository extends JpaRepository<Sequence, Long> {
    Optional<Sequence> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensemblTranscriptId);
}
