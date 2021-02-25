package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import liquibase.pro.packaged.T;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    @Query("select t from Transcript t join t.transcriptUsages tu where t.referenceGenome= ?1 and tu.source= ?2")
    List<Transcript> findByReferenceGenomeAndSource(ReferenceGenome referenceGenome, UsageSource source);

    @Query("select t from Transcript t join t.transcriptUsages tu where t.referenceGenome= ?1 and tu.source= ?2 and t.hugoSymbol=?3")
    List<Transcript> findByReferenceGenomeAndSourceAndHugoSymbol(ReferenceGenome referenceGenome, UsageSource source, String hugoSymbol);

    @Query(
        "select t from Transcript t join t.transcriptUsages tu where t.referenceGenome= ?1 and t.ensemblTranscriptId=?2 and tu.source= ?3"
    )
    List<Transcript> findByReferenceGenomeAndEnsemblTranscriptAndSource(
        ReferenceGenome referenceGenome,
        String ensemblTranscriptId,
        UsageSource source
    );

    Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensemblTranscriptId);

    List<Transcript> findByReferenceGenome(ReferenceGenome referenceGenome);
}
