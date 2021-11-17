package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Gene;
import org.mskcc.oncokb.transcript.repository.GeneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Gene}.
 */
@Service
@Transactional
public class GeneService {

    private final Logger log = LoggerFactory.getLogger(GeneService.class);

    private final GeneRepository geneRepository;

    public GeneService(GeneRepository geneRepository) {
        this.geneRepository = geneRepository;
    }

    /**
     * Save a gene.
     *
     * @param gene the entity to save.
     * @return the persisted entity.
     */
    public Gene save(Gene gene) {
        log.debug("Request to save Gene : {}", gene);
        return geneRepository.save(gene);
    }

    /**
     * Partially update a gene.
     *
     * @param gene the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Gene> partialUpdate(Gene gene) {
        log.debug("Request to partially update Gene : {}", gene);

        return geneRepository
            .findById(gene.getId())
            .map(existingGene -> {
                if (gene.getEntrezGeneId() != null) {
                    existingGene.setEntrezGeneId(gene.getEntrezGeneId());
                }
                if (gene.getHugoSymbol() != null) {
                    existingGene.setHugoSymbol(gene.getHugoSymbol());
                }

                return existingGene;
            })
            .map(geneRepository::save);
    }

    /**
     * Get all the genes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Gene> findAll() {
        log.debug("Request to get all Genes");
        return geneRepository.findAll();
    }

    /**
     * Get one gene by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Gene> findOne(Long id) {
        log.debug("Request to get Gene : {}", id);
        return geneRepository.findById(id);
    }

    /**
     * Delete the gene by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Gene : {}", id);
        geneRepository.deleteById(id);
    }
}
