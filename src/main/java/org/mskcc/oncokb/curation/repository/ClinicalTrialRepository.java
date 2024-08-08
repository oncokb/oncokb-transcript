package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.ClinicalTrial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ClinicalTrial entity.
 */
@JaversSpringDataAuditable
@Repository
public interface ClinicalTrialRepository extends JpaRepository<ClinicalTrial, Long>, JpaSpecificationExecutor<ClinicalTrial> {
    @Query(
        value = "select distinct clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.associations",
        countQuery = "select count(distinct clinicalTrial) from ClinicalTrial clinicalTrial"
    )
    Page<ClinicalTrial> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.associations")
    List<ClinicalTrial> findAllWithEagerRelationships();

    @Query("select clinicalTrial from ClinicalTrial clinicalTrial left join fetch clinicalTrial.associations where clinicalTrial.id =:id")
    Optional<ClinicalTrial> findOneWithEagerRelationships(@Param("id") Long id);
}
