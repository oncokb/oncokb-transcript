package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Treatment;
import org.mskcc.oncokb.curation.repository.TreatmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Treatment}.
 */
@Service
@Transactional
public class TreatmentService {

    private final Logger log = LoggerFactory.getLogger(TreatmentService.class);

    private final TreatmentRepository treatmentRepository;

    public TreatmentService(TreatmentRepository treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }

    /**
     * Save a treatment.
     *
     * @param treatment the entity to save.
     * @return the persisted entity.
     */
    public Treatment save(Treatment treatment) {
        log.debug("Request to save Treatment : {}", treatment);
        return treatmentRepository.save(treatment);
    }

    /**
     * Partially update a treatment.
     *
     * @param treatment the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Treatment> partialUpdate(Treatment treatment) {
        log.debug("Request to partially update Treatment : {}", treatment);

        return treatmentRepository
            .findById(treatment.getId())
            .map(existingTreatment -> {
                if (treatment.getName() != null) {
                    existingTreatment.setName(treatment.getName());
                }

                return existingTreatment;
            })
            .map(treatmentRepository::save);
    }

    /**
     * Get all the treatments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Treatment> findAll(Pageable pageable) {
        log.debug("Request to get all Treatments");
        return treatmentRepository.findAll(pageable);
    }

    /**
     * Get all the treatments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Treatment> findAllWithEagerRelationships(Pageable pageable) {
        Page<Treatment> treatmentPage = treatmentRepository.findAll(pageable);
        List<Treatment> enrichedTreatments = treatmentRepository.findAllWithEagerRelationships(
            treatmentPage.getContent().stream().map(Treatment::getId).collect(Collectors.toList())
        );
        return new PageImpl<Treatment>(enrichedTreatments, pageable, treatmentPage.getTotalElements());
    }

    /**
     * Get one treatment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Treatment> findOne(Long id) {
        log.debug("Request to get Treatment : {}", id);
        return treatmentRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the treatment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Treatment : {}", id);
        treatmentRepository.deleteById(id);
    }

    public List<Treatment> searchTreatment(String query) {
        return treatmentRepository.searchTreatment(query);
    }
}
