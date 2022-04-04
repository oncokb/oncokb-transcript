package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.VariantConsequence;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the VariantConsequence entity.
 */
@SuppressWarnings("unused")
@Repository
public interface VariantConsequenceRepository extends JpaRepository<VariantConsequence, Long> {}
