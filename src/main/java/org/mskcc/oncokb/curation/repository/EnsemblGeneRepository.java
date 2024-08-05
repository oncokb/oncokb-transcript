package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the EnsemblGene entity.
 */
@JaversSpringDataAuditable
@Repository
public interface EnsemblGeneRepository extends JpaRepository<EnsemblGene, Long>, JpaSpecificationExecutor<EnsemblGene> {
    @Query("select eg from EnsemblGene  eg join eg.gene  g where g.entrezGeneId=?1 and eg.canonical=true and eg.referenceGenome=?2")
    Optional<EnsemblGene> findCanonicalEnsemblGene(Integer entrezGeneId, ReferenceGenome referenceGenome);

    List<EnsemblGene> findAllByGeneAndReferenceGenome(Gene gene, ReferenceGenome referenceGenome);

    List<EnsemblGene> findAllByReferenceGenomeAndEnsemblGeneIdIn(ReferenceGenome referenceGenome, List<String> ensemblGeneIds);
}
