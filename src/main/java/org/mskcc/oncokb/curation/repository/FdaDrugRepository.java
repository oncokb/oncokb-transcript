package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FdaDrug entity.
 */
@JaversSpringDataAuditable
@Repository
public interface FdaDrugRepository extends JpaRepository<FdaDrug, Long>, JpaSpecificationExecutor<FdaDrug> {
    public Optional<FdaDrug> findFirstByApplicationNumber(String applicationNumber);
}
