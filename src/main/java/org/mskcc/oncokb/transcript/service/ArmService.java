package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Arm;
import org.mskcc.oncokb.transcript.repository.ArmRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Arm}.
 */
@Service
@Transactional
public class ArmService {

    private final Logger log = LoggerFactory.getLogger(ArmService.class);

    private final ArmRepository armRepository;

    public ArmService(ArmRepository armRepository) {
        this.armRepository = armRepository;
    }

    /**
     * Save a arm.
     *
     * @param arm the entity to save.
     * @return the persisted entity.
     */
    public Arm save(Arm arm) {
        log.debug("Request to save Arm : {}", arm);
        return armRepository.save(arm);
    }

    /**
     * Partially update a arm.
     *
     * @param arm the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Arm> partialUpdate(Arm arm) {
        log.debug("Request to partially update Arm : {}", arm);

        return armRepository
            .findById(arm.getId())
            .map(
                existingArm -> {
                    if (arm.getDescription() != null) {
                        existingArm.setDescription(arm.getDescription());
                    }

                    return existingArm;
                }
            )
            .map(armRepository::save);
    }

    /**
     * Get all the arms.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Arm> findAll() {
        log.debug("Request to get all Arms");
        return armRepository.findAll();
    }

    /**
     * Get one arm by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Arm> findOne(Long id) {
        log.debug("Request to get Arm : {}", id);
        return armRepository.findById(id);
    }

    /**
     * Delete the arm by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Arm : {}", id);
        armRepository.deleteById(id);
    }
}
