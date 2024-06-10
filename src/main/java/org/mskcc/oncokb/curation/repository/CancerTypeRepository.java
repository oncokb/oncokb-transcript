package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
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

    @Query(
        "SELECT cancerType from CancerType cancerType WHERE cancerType.mainType LIKE %:containing% OR cancerType.subtype LIKE %:containing% OR cancerType.code LIKE %:containing% ORDER BY CASE WHEN cancerType.subtype LIKE :startsWith% THEN 0 WHEN cancerType.subtype IS NULL AND cancerType.mainType LIKE :startsWith% THEN 0 ELSE 1 END"
    )
    Page<CancerType> findAllByQueryPrioritizeStartsWith(
        @Param("containing") String containing,
        @Param("startsWith") String startsWith,
        Pageable pageable
    );

    List<CancerType> findAllByMainTypeIs(@Param("maintype") String mainType);

    List<CancerType> findByTumorFormIn(List<TumorForm> tumorForms);

    Optional<CancerType> findOneByCodeIgnoreCase(String code);

    Optional<CancerType> findOneBySubtypeIgnoreCase(String subtype);

    Optional<CancerType> findOneByMainTypeIgnoreCaseAndCodeIsNull(String mainType);

    Optional<CancerType> findByMainTypeAndSubtypeIsNull(String mainType);
}
