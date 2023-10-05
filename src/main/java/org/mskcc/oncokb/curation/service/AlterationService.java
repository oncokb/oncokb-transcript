package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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

    public AlterationService(AlterationRepository alterationRepository) {
        this.alterationRepository = alterationRepository;
    }

    /**
     * Save a alteration.
     *
     * @param alteration the entity to save.
     * @return the persisted entity.
     */
    public Alteration save(Alteration alteration) {
        log.debug("Request to save Alteration : {}", alteration);
        return alterationRepository.save(alteration);
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
            .map(alterationRepository::save);
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
        Page<Alteration> alterationPage = alterationRepository.findAll(pageable);
        List<Alteration> enrichedAlterations = alterationRepository.findAllWithEagerRelationships(
            alterationPage.getContent().stream().map(Alteration::getId).collect(Collectors.toList())
        );
        return new PageImpl<>(enrichedAlterations, pageable, enrichedAlterations.size());
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
        return alterationRepository.findOneWithEagerRelationships(id);
    }

    @Transactional(readOnly = true)
    public List<Alteration> findByGeneId(Long geneId) {
        return alterationRepository.findByGenesId(geneId);
    }

    public Page<Alteration> search(String query, Pageable pageable) {
        Page<Alteration> alterationPage = alterationRepository.searchAlteration(query, pageable);
        Page<Alteration> page = new PageImpl<>(
            alterationRepository.findAllWithEagerRelationships(
                alterationPage.getContent().stream().map(Alteration::getId).collect(Collectors.toList())
            ),
            pageable,
            alterationPage.getTotalElements()
        );
        return page;
    }

    public Optional<Alteration> findByNameAndGeneId(String alterationName, Long geneId) {
        return alterationRepository.findByNameAndGenesId(alterationName, geneId);
    }

    /**
     * Delete the alteration by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Alteration : {}", id);
        alterationRepository.deleteById(id);
    }
}
