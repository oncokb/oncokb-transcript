package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the ClinicalTrialsGovCondition entity.
 */
@Repository
public interface ClinicalTrialsGovConditionRepository
    extends JpaRepository<ClinicalTrialsGovCondition, Long>, JpaSpecificationExecutor<ClinicalTrialsGovCondition> {
    @Query(
        value = "select distinct clinicalTrialsGovCondition from ClinicalTrialsGovCondition clinicalTrialsGovCondition left join fetch clinicalTrialsGovCondition.cancerTypes",
        countQuery = "select count(distinct clinicalTrialsGovCondition) from ClinicalTrialsGovCondition clinicalTrialsGovCondition"
    )
    Page<ClinicalTrialsGovCondition> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct clinicalTrialsGovCondition from ClinicalTrialsGovCondition clinicalTrialsGovCondition left join fetch clinicalTrialsGovCondition.cancerTypes"
    )
    List<ClinicalTrialsGovCondition> findAllWithEagerRelationships();

    @Query(
        "select clinicalTrialsGovCondition from ClinicalTrialsGovCondition clinicalTrialsGovCondition left join fetch clinicalTrialsGovCondition.cancerTypes where clinicalTrialsGovCondition.id =:id"
    )
    Optional<ClinicalTrialsGovCondition> findOneWithEagerRelationships(@Param("id") Long id);
}
