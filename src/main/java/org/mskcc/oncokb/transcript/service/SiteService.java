package org.mskcc.oncokb.transcript.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Site;
import org.mskcc.oncokb.transcript.repository.SiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static org.mskcc.oncokb.transcript.config.Constants.SITE_AACT_QUERY_SEPARATOR;

/**
 * Service Implementation for managing {@link Site}.
 */
@Service
@Transactional
public class SiteService {

    private final Logger log = LoggerFactory.getLogger(SiteService.class);

    private final SiteRepository siteRepository;

    public SiteService(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
    }

    public String generateAactQuery(String name, String city, String state, String country) {
        List<String> query = new ArrayList<>();
        query.add(name);
        query.add(city);
        query.add(state);
        query.add(country);
        return String.join(SITE_AACT_QUERY_SEPARATOR, query);
    }

    /**
     * Save a site.
     *
     * @param site the entity to save.
     * @return the persisted entity.
     */
    public Site save(Site site) {
        log.debug("Request to save Site : {}", site);
        return siteRepository.save(site);
    }

    /**
     * Partially update a site.
     *
     * @param site the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Site> partialUpdate(Site site) {
        log.debug("Request to partially update Site : {}", site);

        return siteRepository
            .findById(site.getId())
            .map(
                existingSite -> {
                    if (site.getAactQuery() != null) {
                        existingSite.setAactQuery(site.getAactQuery());
                    }
                    if (site.getAddress() != null) {
                        existingSite.setAddress(site.getAddress());
                    }
                    if (site.getCity() != null) {
                        existingSite.setCity(site.getCity());
                    }
                    if (site.getCountry() != null) {
                        existingSite.setCountry(site.getCountry());
                    }
                    if (site.getName() != null) {
                        existingSite.setName(site.getName());
                    }
                    if (site.getState() != null) {
                        existingSite.setState(site.getState());
                    }
                    if (site.getCoordinates() != null) {
                        existingSite.setCoordinates(site.getCoordinates());
                    }
                    if (site.getGoogleMapResult() != null) {
                        existingSite.setGoogleMapResult(site.getGoogleMapResult());
                    }

                    return existingSite;
                }
            )
            .map(siteRepository::save);
    }

    /**
     * Get all the sites.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Site> findAll() {
        log.debug("Request to get all Sites");
        return siteRepository.findAll();
    }

    /**
     * Get one site by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Site> findOne(Long id) {
        log.debug("Request to get Site : {}", id);
        return siteRepository.findById(id);
    }

    /**
     * Delete the site by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Site : {}", id);
        siteRepository.deleteById(id);
    }

    Optional<Site> findOneByNameAndCityAndStateAndCountry(String name, String city, String state, String country) {
        return siteRepository.findOneByNameAndCityAndStateAndCountry(name, city, state, country);
    }

    Optional<Site> findOneByAactQuery(String name, String city, String state, String country) {
        String aactQuery = generateAactQuery(name, city, state, country);
        return siteRepository.findOneByAactQuery(aactQuery);
    }

    List<Site> findAllWithEmptyCoordinates() {
        return siteRepository.findAllByCoordinatesEquals("");
    }

    Optional<Site> findOneByCoordinates(String coordinates) {
        return siteRepository.findOneByCoordinates(coordinates);
    }
}
