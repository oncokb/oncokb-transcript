package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Alteration;
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
                if (alteration.getType() != null) {
                    existingAlteration.setType(alteration.getType());
                }
                if (alteration.getName() != null) {
                    existingAlteration.setName(alteration.getName());
                }
                if (alteration.getAlteration() != null) {
                    existingAlteration.setAlteration(alteration.getAlteration());
                }
                if (alteration.getProteinChange() != null) {
                    existingAlteration.setProteinChange(alteration.getProteinChange());
                }
                if (alteration.getStart() != null) {
                    existingAlteration.setStart(alteration.getStart());
                }
                if (alteration.getEnd() != null) {
                    existingAlteration.setEnd(alteration.getEnd());
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
        return alterationRepository.findAll(pageable);
    }

    /**
     * Get all the alterations with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Alteration> findAllWithEagerRelationships(Pageable pageable) {
        Page<Alteration> alterationPage = alterationRepository.findAll(pageable);
        List<Alteration> enrichedAlterations = alterationRepository.findAllWithEagerRelationships(
            alterationPage.getContent().stream().map(Alteration::getId).collect(Collectors.toList())
        );
        return new PageImpl<>(enrichedAlterations, pageable, alterationPage.getTotalElements());
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

    /**
     * Get alterations by their id.
     *
     * @param ids the list of id.
     * @return list of entity.
     */
    @Transactional(readOnly = true)
    public List<Alteration> findAllWithEagerRelationshipsByIds(List<Long> ids) {
        log.debug("Request to get Alteration : {}", ids);
        return alterationRepository.findAllWithEagerRelationships(ids);
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

    public List<Alteration> findByNameOrAlterationAndGenesId(String query, Long geneId) {
        return alterationRepository.findByNameOrAlterationAndGenesId(query, geneId);
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
