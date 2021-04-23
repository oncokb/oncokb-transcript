package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Drug;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Drug entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DrugRepository extends JpaRepository<Drug, Long> {
    Optional<Drug> findOneByCode(String code);

    Optional<Drug> findOneByName(String name);

    @Query(
        "select d from Drug d join d.drugSynonyms ds where lower(d.name) like lower(concat('%', ?1,'%')) or lower(d.code) like lower(concat('%', ?1,'%')) or lower(ds.name) like lower(concat('%', ?1,'%'))"
    )
    List<Drug> searchDrug(String query);
}
