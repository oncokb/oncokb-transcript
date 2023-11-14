package org.mskcc.oncokb.curation.repository;

import java.util.List;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the GenomeFragment entity.
 */
@JaversSpringDataAuditable
@Repository
public interface GenomeFragmentRepository extends JpaRepository<GenomeFragment, Long>, JpaSpecificationExecutor<GenomeFragment> {
    @Query("select genomeFragment from GenomeFragment genomeFragment where genomeFragment.transcript.id = ?1")
    List<GenomeFragment> findAllByTranscriptId(Long id);
}
