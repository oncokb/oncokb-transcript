package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.mskcc.oncokb.curation.repository.FdaDrugRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link FdaDrug}.
 */
@Service
@Transactional
public class FdaDrugService {

    private final Logger log = LoggerFactory.getLogger(FdaDrugService.class);

    private final FdaDrugRepository fdaDrugRepository;

    public FdaDrugService(FdaDrugRepository fdaDrugRepository) {
        this.fdaDrugRepository = fdaDrugRepository;
    }

    /**
     * Save a fdaDrug.
     *
     * @param fdaDrug the entity to save.
     * @return the persisted entity.
     */
    public FdaDrug save(FdaDrug fdaDrug) {
        log.debug("Request to save FdaDrug : {}", fdaDrug);
        FdaDrug result = fdaDrugRepository.save(fdaDrug);
        return result;
    }

    /**
     * Partially update a fdaDrug.
     *
     * @param fdaDrug the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FdaDrug> partialUpdate(FdaDrug fdaDrug) {
        log.debug("Request to partially update FdaDrug : {}", fdaDrug);

        return fdaDrugRepository
            .findById(fdaDrug.getId())
            .map(existingFdaDrug -> {
                if (fdaDrug.getApplicationNumber() != null) {
                    existingFdaDrug.setApplicationNumber(fdaDrug.getApplicationNumber());
                }
                return existingFdaDrug;
            })
            .map(fdaDrugRepository::save);
    }

    /**
     * Get all the fdaDrugs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<FdaDrug> findAll(Pageable pageable) {
        log.debug("Request to get all FdaDrugs");
        return fdaDrugRepository.findAll(pageable);
    }

    /**
     *  Get all the fdaDrugs where Drug is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FdaDrug> findAllWhereDrugIsNull() {
        log.debug("Request to get all fdaDrugs where Drug is null");
        return StreamSupport
            .stream(fdaDrugRepository.findAll().spliterator(), false)
            .filter(fdaDrug -> fdaDrug.getDrug() == null)
            .collect(Collectors.toList());
    }

    /**
     * Get one fdaDrug by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FdaDrug> findOne(Long id) {
        log.debug("Request to get FdaDrug : {}", id);
        return fdaDrugRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<FdaDrug> findOneByApplicationNumber(String applicationNumber) {
        return fdaDrugRepository.findFirstByApplicationNumber(applicationNumber);
    }

    /**
     * Delete the fdaDrug by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete FdaDrug : {}", id);
        fdaDrugRepository.deleteById(id);
    }
}
