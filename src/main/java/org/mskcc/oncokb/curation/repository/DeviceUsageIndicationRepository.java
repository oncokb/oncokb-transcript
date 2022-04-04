package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DeviceUsageIndication entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DeviceUsageIndicationRepository extends JpaRepository<DeviceUsageIndication, Long> {}
