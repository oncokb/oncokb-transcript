package org.mskcc.oncokb.transcript.repository;

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
}
