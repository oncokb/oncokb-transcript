package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Drug;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Drug entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DrugRepository extends JpaRepository<Drug, Long>, JpaSpecificationExecutor<Drug> {
    Optional<Drug> findOneByCode(String code);

    List<Drug> findByNameIgnoreCase(String name);

    @Query(
        "select distinct d from Drug d join d.synonyms ds where lower(d.name) like lower(concat('%', ?1,'%')) or lower(d.code) like lower(concat('%', ?1,'%')) or lower(ds.name) like lower(concat('%', ?1,'%'))"
    )
    List<Drug> searchDrug(String query);
}
