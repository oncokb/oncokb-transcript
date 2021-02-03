package org.mskcc.cbio.repository;

import java.util.Optional;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    Optional<Transcript> findByReferenceGenomeAndEntrezGeneId(ReferenceGenome referenceGenome, int entrezGeneId);

    Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensemblTranscriptId);
}
