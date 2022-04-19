package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DrugBrand entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DrugBrandRepository extends JpaRepository<DrugBrand, Long> {}
