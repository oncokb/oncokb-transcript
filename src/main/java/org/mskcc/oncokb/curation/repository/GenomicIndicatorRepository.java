package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the GenomicIndicator entity.
 */
@JaversSpringDataAuditable
@Repository
public interface GenomicIndicatorRepository extends JpaRepository<GenomicIndicator, Long>, JpaSpecificationExecutor<GenomicIndicator> {
    @Query(
        value = "select distinct genomicIndicator from GenomicIndicator genomicIndicator left join fetch genomicIndicator.associations",
        countQuery = "select count(distinct genomicIndicator) from GenomicIndicator genomicIndicator"
    )
    Page<GenomicIndicator> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct genomicIndicator from GenomicIndicator genomicIndicator left join fetch genomicIndicator.associations")
    List<GenomicIndicator> findAllWithEagerRelationships();

    @Query(
        "select genomicIndicator from GenomicIndicator genomicIndicator left join fetch genomicIndicator.associations where genomicIndicator.id =:id"
    )
    Optional<GenomicIndicator> findOneWithEagerRelationships(@Param("id") Long id);
}
