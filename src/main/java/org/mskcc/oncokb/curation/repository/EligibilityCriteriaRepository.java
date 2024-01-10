package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the EligibilityCriteria entity.
 */
@JaversSpringDataAuditable
@Repository
public interface EligibilityCriteriaRepository
    extends JpaRepository<EligibilityCriteria, Long>, JpaSpecificationExecutor<EligibilityCriteria> {
    @Query(
        value = "select distinct eligibilityCriteria from EligibilityCriteria eligibilityCriteria left join fetch eligibilityCriteria.associations",
        countQuery = "select count(distinct eligibilityCriteria) from EligibilityCriteria eligibilityCriteria"
    )
    Page<EligibilityCriteria> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct eligibilityCriteria from EligibilityCriteria eligibilityCriteria left join fetch eligibilityCriteria.associations"
    )
    List<EligibilityCriteria> findAllWithEagerRelationships();

    @Query(
        "select eligibilityCriteria from EligibilityCriteria eligibilityCriteria left join fetch eligibilityCriteria.associations where eligibilityCriteria.id =:id"
    )
    Optional<EligibilityCriteria> findOneWithEagerRelationships(@Param("id") Long id);
}
