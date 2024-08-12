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
 * Spring Data JPA repository for the GenomicIndicator entity.
 */
@JaversSpringDataAuditable
@Repository
public interface GenomicIndicatorRepository extends JpaRepository<GenomicIndicator, Long>, JpaSpecificationExecutor<GenomicIndicator> {
    @Query(
        "select distinct genomicIndicator from GenomicIndicator genomicIndicator left join fetch genomicIndicator.alleleStates left join fetch genomicIndicator.associations acat " +
        "left join fetch acat.alterations alts " +
        "left join fetch alts.genes "
    )
    List<GenomicIndicator> findAllWithEagerRelationships();

    @Query(
        "select genomicIndicator from GenomicIndicator genomicIndicator left join fetch genomicIndicator.alleleStates left join fetch genomicIndicator.associations acat " +
        "left join fetch acat.alterations alts " +
        "left join fetch alts.genes " +
        "where genomicIndicator.id =:id"
    )
    Optional<GenomicIndicator> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select genomicIndicator from GenomicIndicator genomicIndicator " +
        "left join fetch genomicIndicator.alleleStates " +
        "left join fetch genomicIndicator.associations acat " +
        "left join fetch acat.alterations alts " +
        "left join fetch alts.genes " +
        "where genomicIndicator.id in(:ids)"
    )
    List<GenomicIndicator> findByIdInWithEagerRelationships(@Param("ids") List<Long> ids);

    Optional<GenomicIndicator> findByTypeAndName(String type, String name);
}
