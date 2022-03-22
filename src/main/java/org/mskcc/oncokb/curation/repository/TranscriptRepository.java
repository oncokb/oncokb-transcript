package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import liquibase.pro.packaged.T;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    @Query("select t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId=?2")
    Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(String referenceGenome, String ensemblTranscriptId);

    @Cacheable(cacheResolver = "transcriptCacheResolver")
    @Query("select t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId in ?2")
    List<Transcript> findByReferenceGenomeAndEnsemblTranscriptIdIsIn(String referenceGenome, List<String> ensemblTranscriptIds);

    List<Transcript> findByEnsemblGene(EnsemblGene ensemblGene);

    @Query("select t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId in ?2")
    List<Transcript> findByEnsemblGeneId(Integer entrezGeneId);

    Optional<Transcript> findByEnsemblGeneAndEnsemblTranscriptId(EnsemblGene ensemblGene, String ensemblTranscriptId);

    Optional<Transcript> findByEnsemblGeneAndCanonicalIsTrue(EnsemblGene ensemblGene);
}
