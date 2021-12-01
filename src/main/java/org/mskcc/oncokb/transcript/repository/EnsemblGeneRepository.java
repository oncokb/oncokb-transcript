package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.Gene;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the EnsemblGene entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EnsemblGeneRepository extends JpaRepository<EnsemblGene, Long> {
    Optional<EnsemblGene> findByEnsemblGeneIdAndReferenceGenome(String ensemblGeneId, ReferenceGenome referenceGenome);

    List<EnsemblGene> findAllByGeneAndReferenceGenome(Gene gene, ReferenceGenome referenceGenome);

    List<EnsemblGene> findAllByReferenceGenomeAndEnsemblGeneIdIn(ReferenceGenome referenceGenome, List<String> ensemblGeneIds);
}
