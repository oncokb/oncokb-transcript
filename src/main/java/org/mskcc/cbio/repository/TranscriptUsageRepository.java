package org.mskcc.cbio.repository;

import java.util.List;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.TranscriptUsage;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.domain.enumeration.UsageSource;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the TranscriptUsage entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TranscriptUsageRepository extends JpaRepository<TranscriptUsage, Long> {
    @Query("select tu from TranscriptUsage tu join tu.transcript t where t.referenceGenome= ?1 and t.hugoSymbol=?2 and tu.source= ?3")
    List<TranscriptUsage> findByReferenceGenomeAndHugoSymbolAndSource(
        ReferenceGenome referenceGenome,
        String hugoSymbol,
        UsageSource source
    );
}
