package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Drug entity.
 */
@Repository
public interface DrugRepository extends JpaRepository<Drug, Long> {
    Optional<Drug> findOneByCode(String code);

    Optional<Drug> findOneByName(String name);

    @Query(
        "select d from Drug d join d.synonyms ds where lower(d.name) like lower(concat('%', ?1,'%')) or lower(d.code) like lower(concat('%', ?1,'%')) or lower(ds.name) like lower(concat('%', ?1,'%'))"
    )
    List<Drug> searchDrug(String query);

    @Query(
        value = "select distinct drug from Drug drug left join fetch drug.arms",
        countQuery = "select count(distinct drug) from Drug drug"
    )
    Page<Drug> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct drug from Drug drug left join fetch drug.arms")
    List<Drug> findAllWithEagerRelationships();

    @Query("select drug from Drug drug left join fetch drug.arms where drug.id =:id")
    Optional<Drug> findOneWithEagerRelationships(@Param("id") Long id);
}
