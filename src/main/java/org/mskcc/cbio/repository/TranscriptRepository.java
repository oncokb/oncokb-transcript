package org.mskcc.cbio.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.domain.enumeration.UsageSource;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    @Query("select t from Transcript t join t.transcriptUsages tu where t.referenceGenome= ?1 and t.hugoSymbol=?2 and tu.source= ?3")
    List<Transcript> findByReferenceGenomeAndHugoSymbolAndSource(ReferenceGenome referenceGenome, String hugoSymbol, UsageSource source);

    Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensemblTranscriptId);
}
