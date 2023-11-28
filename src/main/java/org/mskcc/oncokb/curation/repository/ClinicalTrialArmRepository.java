package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the ClinicalTrialArm entity.
 */
@JaversSpringDataAuditable
@Repository
public interface ClinicalTrialArmRepository extends JpaRepository<ClinicalTrialArm, Long>, JpaSpecificationExecutor<ClinicalTrialArm> {
    @Query(
        value = "select distinct clinicalTrialArm from ClinicalTrialArm clinicalTrialArm left join fetch clinicalTrialArm.associations",
        countQuery = "select count(distinct clinicalTrialArm) from ClinicalTrialArm clinicalTrialArm"
    )
    Page<ClinicalTrialArm> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct clinicalTrialArm from ClinicalTrialArm clinicalTrialArm left join fetch clinicalTrialArm.associations")
    List<ClinicalTrialArm> findAllWithEagerRelationships();

    @Query(
        "select clinicalTrialArm from ClinicalTrialArm clinicalTrialArm left join fetch clinicalTrialArm.associations where clinicalTrialArm.id =:id"
    )
    Optional<ClinicalTrialArm> findOneWithEagerRelationships(@Param("id") Long id);
}
