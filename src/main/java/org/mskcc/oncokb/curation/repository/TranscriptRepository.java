package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Transcript entity.
 */
@JaversSpringDataAuditable
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long>, JpaSpecificationExecutor<Transcript> {
    @Query("select t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId=?2")
    Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensemblTranscriptId);

    @Cacheable(cacheResolver = "transcriptCacheResolver")
    @Query("select distinct t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId in ?2")
    List<Transcript> findByReferenceGenomeAndEnsemblTranscriptIdIsIn(String referenceGenome, List<String> ensemblTranscriptIds);

    List<Transcript> findByEnsemblGene(EnsemblGene ensemblGene);

    @Query("select distinct t from Transcript t join t.ensemblGene eg where eg.referenceGenome= ?1 and t.ensemblTranscriptId in ?2")
    List<Transcript> findByEnsemblGeneId(Integer entrezGeneId);

    Optional<Transcript> findByEnsemblGeneAndEnsemblTranscriptId(EnsemblGene ensemblGene, String ensemblTranscriptId);

    @Cacheable(cacheResolver = "transcriptCacheResolver")
    @Query(
        "select distinct transcript from Transcript transcript left join fetch transcript.flags where transcript.ensemblGene=:ensemblGene and transcript.canonical is true"
    )
    Optional<Transcript> findByEnsemblGeneAndCanonicalIsTrue(@Param("ensemblGene") EnsemblGene ensemblGene);

    Optional<Transcript> findByGeneAndReferenceGenomeAndCanonicalIsTrue(Gene gene, ReferenceGenome referenceGenome);

    List<Transcript> findAllByIdIn(List<Long> ids);

    @Query("select distinct transcript from Transcript transcript left join fetch transcript.flags where transcript.id =:id")
    Optional<Transcript> findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select distinct transcript from Transcript transcript left join fetch transcript.flags where transcript.id in :ids")
    List<Transcript> findAllWithEagerRelationships(@Param("ids") List<Long> ids);
}
