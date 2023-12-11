package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CancerType entity.
 */
@JaversSpringDataAuditable
@Repository
public interface CancerTypeRepository extends JpaRepository<CancerType, Long>, JpaSpecificationExecutor<CancerType> {
    @Query(
        value = "select distinct cancerType from CancerType cancerType left join fetch cancerType.synonyms",
        countQuery = "select count(distinct cancerType) from CancerType cancerType"
    )
    Page<CancerType> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct cancerType from CancerType cancerType left join fetch cancerType.synonyms")
    List<CancerType> findAllWithEagerRelationships();

    @Query("select cancerType from CancerType cancerType left join fetch cancerType.synonyms where cancerType.id =:id")
    Optional<CancerType> findOneWithEagerRelationships(@Param("id") Long id);

    List<CancerType> findAllByMainTypeIs(@Param("maintype") String mainType);

    Optional<CancerType> findOneByCodeIgnoreCase(String code);

    Optional<CancerType> findOneBySubtypeIgnoreCase(String subtype);

    Optional<CancerType> findOneByMainTypeIgnoreCaseAndLevel(String mainType, Integer level);
}
