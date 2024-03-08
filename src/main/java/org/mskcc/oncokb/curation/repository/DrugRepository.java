package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Drug entity.
 */
@JaversSpringDataAuditable
@Repository
public interface DrugRepository extends JpaRepository<Drug, Long>, JpaSpecificationExecutor<Drug> {
    @Query(value = "select distinct drug from Drug drug", countQuery = "select count(distinct drug) from Drug drug")
    Page<Drug> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct drug from Drug drug" +
        " left join fetch drug.flags" +
        " left join fetch drug.fdaDrugs" +
        " left join fetch drug.associations da" +
        " left join fetch da.rules" +
        " left join fetch da.cancerTypes" +
        " left join fetch da.drugs" +
        " left join fetch da.alterations daa" +
        " left join fetch daa.genes"
    )
    List<Drug> findAllWithEagerRelationships();

    @Query(
        "select drug from Drug drug" +
        " left join fetch drug.flags" +
        " left join fetch drug.fdaDrugs" +
        " left join fetch drug.associations da" +
        " left join fetch da.rules" +
        " left join fetch da.cancerTypes" +
        " left join fetch da.drugs" +
        " left join fetch da.alterations daa" +
        " left join fetch daa.genes" +
        " left join fetch drug.nciThesaurus ncit" +
        " left join fetch ncit.synonyms" +
        " where drug.id =:id"
    )
    Optional<Drug> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select distinct drug from Drug drug" +
        " left join fetch drug.flags" +
        " left join fetch drug.fdaDrugs" +
        " left join fetch drug.associations da" +
        " left join fetch da.rules" +
        " left join fetch da.cancerTypes" +
        " left join fetch da.drugs" +
        " left join fetch da.alterations daa" +
        " left join fetch daa.genes" +
        " where drug.id in (:ids)"
    )
    List<Drug> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    @Query(
        "select distinct drug from Drug drug left join fetch drug.flags where drug.nciThesaurus is not null  and drug.nciThesaurus.code=:code"
    )
    Optional<Drug> findOneByCodeWithEagerRelationships(@Param("code") String code);

    @Query("select distinct drug from Drug drug left join fetch drug.flags where drug.name=:name")
    Optional<Drug> findByNameIgnoreCaseWithEagerRelationships(@Param("name") String name);

    @Query(
        "select distinct d from Drug d" +
        " left join fetch d.flags " +
        " where lower(d.name) like lower(concat('%', ?1,'%')) or lower(d.nciThesaurus.code) like lower(concat('%', ?1,'%'))"
    )
    List<Drug> searchDrug(String query);
}
