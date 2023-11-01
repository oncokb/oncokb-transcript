package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.AssociationCancerType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the AssociationCancerType entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AssociationCancerTypeRepository extends JpaRepository<AssociationCancerType, Long> {}
