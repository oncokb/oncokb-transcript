package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.Alteration;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Alteration entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AlterationRepository extends JpaRepository<Alteration, Long> {}
