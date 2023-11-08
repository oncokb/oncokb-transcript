package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.repository.SynonymRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Synonym}.
 */
@Service
@Transactional
public class SynonymService {

    private final Logger log = LoggerFactory.getLogger(SynonymService.class);

    private final SynonymRepository synonymRepository;

    public SynonymService(SynonymRepository synonymRepository) {
        this.synonymRepository = synonymRepository;
    }

    /**
     * Save a synonym.
     *
     * @param synonym the entity to save.
     * @return the persisted entity.
     */
    public Synonym save(Synonym synonym) {
        log.debug("Request to save Synonym : {}", synonym);
        return synonymRepository.save(synonym);
    }

    /**
     * Partially update a synonym.
     *
     * @param synonym the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Synonym> partialUpdate(Synonym synonym) {
        log.debug("Request to partially update Synonym : {}", synonym);

        return synonymRepository
            .findById(synonym.getId())
            .map(existingSynonym -> {
                if (synonym.getType() != null) {
                    existingSynonym.setType(synonym.getType());
                }
                if (synonym.getSource() != null) {
                    existingSynonym.setSource(synonym.getSource());
                }
                if (synonym.getCode() != null) {
                    existingSynonym.setCode(synonym.getCode());
                }
                if (synonym.getName() != null) {
                    existingSynonym.setName(synonym.getName());
                }
                if (synonym.getNote() != null) {
                    existingSynonym.setNote(synonym.getNote());
                }

                return existingSynonym;
            })
            .map(synonymRepository::save);
    }

    /**
     * Get all the synonyms.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Synonym> findAll(Pageable pageable) {
        log.debug("Request to get all Synonyms");
        return synonymRepository.findAll(pageable);
    }

    /**
     * Get one synonym by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Synonym> findOne(Long id) {
        log.debug("Request to get Synonym : {}", id);
        return synonymRepository.findById(id);
    }

    /**
     * Delete the synonym by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Synonym : {}", id);
        synonymRepository.deleteById(id);
    }
}
