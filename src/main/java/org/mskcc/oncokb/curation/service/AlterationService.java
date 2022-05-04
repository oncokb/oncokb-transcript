package org.mskcc.oncokb.curation.service;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.repository.search.AlterationSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Alteration}.
 */
@Service
@Transactional
public class AlterationService {

    private final Logger log = LoggerFactory.getLogger(AlterationService.class);

    private final AlterationRepository alterationRepository;

    private final AlterationSearchRepository alterationSearchRepository;

    public AlterationService(AlterationRepository alterationRepository, AlterationSearchRepository alterationSearchRepository) {
        this.alterationRepository = alterationRepository;
        this.alterationSearchRepository = alterationSearchRepository;
    }

    /**
     * Save a alteration.
     *
     * @param alteration the entity to save.
     * @return the persisted entity.
     */
    public Alteration save(Alteration alteration) {
        log.debug("Request to save Alteration : {}", alteration);
        Alteration result = alterationRepository.save(alteration);
        alterationSearchRepository.save(result);
        return result;
    }

    /**
     * Partially update a alteration.
     *
     * @param alteration the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Alteration> partialUpdate(Alteration alteration) {
        log.debug("Request to partially update Alteration : {}", alteration);

        return alterationRepository
            .findById(alteration.getId())
            .map(existingAlteration -> {
                if (alteration.getType() != null) {
                    existingAlteration.setType(alteration.getType());
                }
                if (alteration.getName() != null) {
                    existingAlteration.setName(alteration.getName());
                }
                if (alteration.getAlteration() != null) {
                    existingAlteration.setAlteration(alteration.getAlteration());
                }
                if (alteration.getProteinStart() != null) {
                    existingAlteration.setProteinStart(alteration.getProteinStart());
                }
                if (alteration.getProteinEnd() != null) {
                    existingAlteration.setProteinEnd(alteration.getProteinEnd());
                }
                if (alteration.getRefResidues() != null) {
                    existingAlteration.setRefResidues(alteration.getRefResidues());
                }
                if (alteration.getVariantResidues() != null) {
                    existingAlteration.setVariantResidues(alteration.getVariantResidues());
                }

                return existingAlteration;
            })
            .map(alterationRepository::save)
            .map(savedAlteration -> {
                alterationSearchRepository.save(savedAlteration);

                return savedAlteration;
            });
    }

    /**
     * Get all the alterations.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Alteration> findAll(Pageable pageable) {
        log.debug("Request to get all Alterations");
        return alterationRepository.findAll(pageable);
    }

    /**
     * Get one alteration by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Alteration> findOne(Long id) {
        log.debug("Request to get Alteration : {}", id);
        return alterationRepository.findById(id);
    }

    /**
     * Delete the alteration by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Alteration : {}", id);
        alterationRepository.deleteById(id);
        alterationSearchRepository.deleteById(id);
    }

    /**
     * Search for the alteration corresponding to the query.
     *
     * @param query the query of the search.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Alteration> search(String query, Pageable pageable) {
        log.debug("Request to search for a page of Alterations for query {}", query);
        return alterationSearchRepository.search(query, pageable);
    }
}
