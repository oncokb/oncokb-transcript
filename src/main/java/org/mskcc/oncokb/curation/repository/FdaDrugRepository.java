package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaDrug entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FdaDrugRepository extends JpaRepository<FdaDrug, Long> {
    public Optional<FdaDrug> findFirstByApplicationNumber(String applicationNumber);
}
