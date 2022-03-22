package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.mskcc.oncokb.curation.repository.GeneAliasRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link GeneAlias}.
 */
@Service
@Transactional
public class GeneAliasService {

    private final Logger log = LoggerFactory.getLogger(GeneAliasService.class);

    private final GeneAliasRepository geneAliasRepository;

    public GeneAliasService(GeneAliasRepository geneAliasRepository) {
        this.geneAliasRepository = geneAliasRepository;
    }

    /**
     * Save a geneAlias.
     *
     * @param geneAlias the entity to save.
     * @return the persisted entity.
     */
    public GeneAlias save(GeneAlias geneAlias) {
        log.debug("Request to save GeneAlias : {}", geneAlias);
        return geneAliasRepository.save(geneAlias);
    }

    /**
     * Partially update a geneAlias.
     *
     * @param geneAlias the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<GeneAlias> partialUpdate(GeneAlias geneAlias) {
        log.debug("Request to partially update GeneAlias : {}", geneAlias);

        return geneAliasRepository
            .findById(geneAlias.getId())
            .map(existingGeneAlias -> {
                if (geneAlias.getName() != null) {
                    existingGeneAlias.setName(geneAlias.getName());
                }

                return existingGeneAlias;
            })
            .map(geneAliasRepository::save);
    }

    /**
     * Get all the geneAliases.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<GeneAlias> findAll() {
        log.debug("Request to get all GeneAliases");
        return geneAliasRepository.findAll();
    }

    /**
     * Get one geneAlias by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<GeneAlias> findOne(Long id) {
        log.debug("Request to get GeneAlias : {}", id);
        return geneAliasRepository.findById(id);
    }

    /**
     * Delete the geneAlias by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete GeneAlias : {}", id);
        geneAliasRepository.deleteById(id);
    }
}
