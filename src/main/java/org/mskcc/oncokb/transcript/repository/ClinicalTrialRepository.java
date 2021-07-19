package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.ClinicalTrial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the ClinicalTrial entity.
 */
@Repository
public interface ClinicalTrialRepository extends JpaRepository<ClinicalTrial, Long> {
    @Query(
        value = "select distinct clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.sites left join fetch clinicalTrial.arms",
        countQuery = "select count(distinct clinicalTrial) from ClinicalTrial clinicalTrial"
    )
    Page<ClinicalTrial> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.sites left join fetch clinicalTrial.arms"
    )
    List<ClinicalTrial> findAllWithEagerRelationships();

    @Query(
        "select clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.sites left join fetch clinicalTrial.arms where clinicalTrial.id =:id"
    )
    Optional<ClinicalTrial> findOneWithEagerRelationships(@Param("id") Long id);
}
