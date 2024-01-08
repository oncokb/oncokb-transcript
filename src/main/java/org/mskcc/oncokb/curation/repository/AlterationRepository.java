package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Alteration entity.
 */
@JaversSpringDataAuditable
@Repository
public interface AlterationRepository extends JpaRepository<Alteration, Long>, JpaSpecificationExecutor<Alteration> {
    @Query(
        value = "select distinct alteration from Alteration alteration" + " left join fetch alteration.genes",
        countQuery = "select count(distinct alteration) from Alteration alteration"
    )
    Page<Alteration> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct alteration from Alteration alteration" + " left join fetch alteration.genes")
    List<Alteration> findAllWithEagerRelationships();

    @Query("select alteration from Alteration alteration" + " left join fetch alteration.genes" + " where alteration.id =:id")
    Optional<Alteration> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select distinct alteration from Alteration alteration" +
        " left join fetch alteration.genes" +
        " left join fetch alteration.consequence" +
        " where alteration.id in (:ids)"
    )
    List<Alteration> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    List<Alteration> findByGenesId(@Param("id") Long id);

    List<Alteration> findByNameOrAlterationAndGenesId(String name, String alteration, Long geneId);

    @Query(
        value = "select distinct a from Alteration a" +
        " where lower(a.name) like lower(concat('%', ?1,'%')) or lower(a.alteration) like lower(concat('%', ?1,'%'))",
        countQuery = "select count(distinct a) from Alteration  a" +
        " where lower(a.name) like lower(concat('%', ?1,'%')) or lower(a.alteration) like lower(concat('%', ?1,'%'))"
    )
    Page<Alteration> searchAlteration(String query, Pageable pageable);
}
