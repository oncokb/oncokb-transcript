package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Site;
import org.mskcc.oncokb.transcript.repository.SiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                    if (site.getAddress() != null) {
                        existingSite.setAddress(site.getAddress());
                    }
                    if (site.getCity() != null) {
                        existingSite.setCity(site.getCity());
                    }
                    if (site.getCountry() != null) {
                        existingSite.setCountry(site.getCountry());
                    }
                    if (site.getEmail() != null) {
                        existingSite.setEmail(site.getEmail());
                    }
                    if (site.getName() != null) {
                        existingSite.setName(site.getName());
                    }
                    if (site.getPhone() != null) {
                        existingSite.setPhone(site.getPhone());
                    }
                    if (site.getState() != null) {
                        existingSite.setState(site.getState());
                    }
                    if (site.getCoordinates() != null) {
                        existingSite.setCoordinates(site.getCoordinates());
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

    Optional<Site> findOneByNameAndCityAndCountry(String name, String city, String country) {
        return siteRepository.findOneByNameAndCityAndCountry(name, city, country);
    }

    Optional<Site> findOneByCoordinates(String coordinates) {
        return siteRepository.findOneByCoordinates(coordinates);
    }
}