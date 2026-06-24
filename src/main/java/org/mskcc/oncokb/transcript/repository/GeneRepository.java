package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Gene;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Gene entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GeneRepository extends JpaRepository<Gene, Long> {
    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<Gene> findByEntrezGeneId(Integer entrezGeneId);

    @Cacheable(cacheResolver = "geneCacheResolver")
    Optional<Gene> findByHugoSymbol(String hugoSymbol);

    @Query("select distinct g from Gene g left join fetch g.geneAliases ga left join fetch g.ensemblGenes eg")
    List<Gene> findAllWithGeneAliasAndEnsemblGenes();

    @Query(
        value = "select g.entrez_gene_id as entrezGeneId, g.hugo_symbol as hugoSymbol, eg.reference_genome as referenceGenome, t.ensembl_transcript_id as ensemblTranscriptId " +
        "from gene g " +
        "left join ensembl_gene eg on eg.gene_id = g.id and eg.canonical = true and eg.reference_genome in ('GRCh37', 'GRCh38') " +
        "left join transcript t on t.ensembl_gene_id = eg.id and t.canonical = true",
        nativeQuery = true
    )
    List<CanonicalTranscriptRow> findCanonicalTranscriptRows();
}
