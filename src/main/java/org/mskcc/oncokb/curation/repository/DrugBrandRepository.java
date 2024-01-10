package org.mskcc.oncokb.curation.repository;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DrugBrand entity.
 */
@JaversSpringDataAuditable
@Repository
public interface DrugBrandRepository extends JpaRepository<DrugBrand, Long>, JpaSpecificationExecutor<DrugBrand> {}
