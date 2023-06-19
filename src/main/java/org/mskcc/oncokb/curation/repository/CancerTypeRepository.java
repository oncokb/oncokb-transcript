package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.CancerType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CancerType entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CancerTypeRepository extends JpaRepository<CancerType, Long>, JpaSpecificationExecutor<CancerType> {}
