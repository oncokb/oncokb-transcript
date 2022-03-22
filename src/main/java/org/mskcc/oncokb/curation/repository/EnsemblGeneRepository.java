package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the EnsemblGene entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EnsemblGeneRepository extends JpaRepository<EnsemblGene, Long> {
    @Query("select eg from EnsemblGene  eg join eg.gene  g where g.entrezGeneId=?1 and eg.canonical=true and eg.referenceGenome=?2")
    Optional<EnsemblGene> findCanonicalEnsemblGene(Integer entrezGeneId, String referenceGenome);

    Optional<EnsemblGene> findByEnsemblGeneIdAndReferenceGenome(String ensemblGeneId, String referenceGenome);

    List<EnsemblGene> findAllByGeneAndReferenceGenome(Gene gene, String referenceGenome);

    List<EnsemblGene> findAllByReferenceGenomeAndEnsemblGeneIdIn(String referenceGenome, List<String> ensemblGeneIds);
}
