package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Treatment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Treatment entity.
 */
@JaversSpringDataAuditable
@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long>, JpaSpecificationExecutor<Treatment> {
    @Query("select treatment from Treatment treatment left join fetch treatment.drugs where treatment.id =:id")
    Optional<Treatment> findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select distinct treatment from Treatment treatment left join fetch treatment.drugs where treatment.id in :ids")
    List<Treatment> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    @Query("select distinct treatment from Treatment treatment left join fetch treatment.drugs")
    List<Treatment> findAllWithEagerRelationships();

    @Query(
        "select distinct treatment from Treatment treatment left join fetch treatment.drugs drugs" +
        " where lower(treatment.name) like lower(concat('%', ?1,'%'))  or drugs.name like lower(concat('%', ?1,'%'))"
    )
    List<Treatment> searchTreatment(String query);
}
