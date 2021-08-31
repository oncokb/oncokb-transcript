package org.mskcc.oncokb.transcript.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Site;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Site entity.
 */
@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    Optional<Site> findOneByNameAndCityAndStateAndCountry(String name, String city, String state, String Country);
    Optional<Site> findOneByNameEqualsAndCityAndStateAndCountry(String name, String city, String state, String Country);
    Optional<Site> findOneByAactQuery(String aactQuery);
    Optional<Site> findOneByCoordinates(String coordinates);
    List<Site> findAllByCoordinatesEqualsAndNameEquals(String coordinates, String name);
}
