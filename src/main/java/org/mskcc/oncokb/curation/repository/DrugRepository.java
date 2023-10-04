package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Drug entity.
 */
@Repository
public interface DrugRepository extends JpaRepository<Drug, Long>, JpaSpecificationExecutor<Drug> {
    @Query(
        value = "select distinct drug from Drug drug left join fetch drug.brands left join fetch drug.synonyms",
        countQuery = "select count(distinct drug) from Drug drug"
    )
    Page<Drug> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct drug from Drug drug left join fetch drug.brands left join fetch drug.synonyms where drug.id=:id")
    Optional<Drug> findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select distinct drug from Drug drug left join fetch drug.brands left join fetch drug.synonyms where drug.code=:code")
    Optional<Drug> findOneByCodeWithEagerRelationships(@Param("code") String code);

    @Query("select distinct drug from Drug drug left join fetch drug.brands left join fetch drug.synonyms where drug.name=:name")
    List<Drug> findByNameIgnoreCaseWithEagerRelationships(@Param("name") String name);

    @Query(
        "select distinct d from Drug d" +
        " left join fetch d.brands" +
        " left join fetch d.synonyms ds" +
        " where lower(d.name) like lower(concat('%', ?1,'%')) or lower(d.code) like lower(concat('%', ?1,'%')) or lower(ds.name) like lower(concat('%', ?1,'%'))"
    )
    List<Drug> searchDrug(String query);
}
