package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.repository.NciThesaurusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link NciThesaurus}.
 */
@Service
@Transactional
public class NciThesaurusService {

    private final Logger log = LoggerFactory.getLogger(NciThesaurusService.class);

    private final NciThesaurusRepository nciThesaurusRepository;

    public NciThesaurusService(NciThesaurusRepository nciThesaurusRepository) {
        this.nciThesaurusRepository = nciThesaurusRepository;
    }

    /**
     * Save a nciThesaurus.
     *
     * @param nciThesaurus the entity to save.
     * @return the persisted entity.
     */
    public NciThesaurus save(NciThesaurus nciThesaurus) {
        log.debug("Request to save NciThesaurus : {}", nciThesaurus);
        // we need to trim the display name and preferred name if it's too long.
        if (StringUtils.isNotEmpty(nciThesaurus.getDisplayName()) && nciThesaurus.getDisplayName().length() > 255) {
            nciThesaurus.setDisplayName(nciThesaurus.getDisplayName().substring(0, 255));
        }
        if (StringUtils.isNotEmpty(nciThesaurus.getPreferredName()) && nciThesaurus.getPreferredName().length() > 255) {
            nciThesaurus.setPreferredName(nciThesaurus.getPreferredName().substring(0, 255));
        }
        return nciThesaurusRepository.save(nciThesaurus);
    }

    /**
     * Partially update a nciThesaurus.
     *
     * @param nciThesaurus the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<NciThesaurus> partialUpdate(NciThesaurus nciThesaurus) {
        log.debug("Request to partially update NciThesaurus : {}", nciThesaurus);

        return nciThesaurusRepository
            .findById(nciThesaurus.getId())
            .map(existingNciThesaurus -> {
                if (nciThesaurus.getVersion() != null) {
                    existingNciThesaurus.setVersion(nciThesaurus.getVersion());
                }
                if (nciThesaurus.getCode() != null) {
                    existingNciThesaurus.setCode(nciThesaurus.getCode());
                }
                if (nciThesaurus.getPreferredName() != null) {
                    existingNciThesaurus.setPreferredName(nciThesaurus.getPreferredName());
                }
                if (nciThesaurus.getDisplayName() != null) {
                    existingNciThesaurus.setDisplayName(nciThesaurus.getDisplayName());
                }

                return existingNciThesaurus;
            })
            .map(nciThesaurusRepository::save);
    }

    /**
     * Get all the nciThesauruses.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<NciThesaurus> findAll(Pageable pageable) {
        log.debug("Request to get all NciThesauruses");
        return nciThesaurusRepository.findAll(pageable);
    }

    /**
     * Get all the nciThesauruses with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<NciThesaurus> findAllWithEagerRelationships(Pageable pageable) {
        Page<NciThesaurus> nciThesaurusPage = nciThesaurusRepository.findAll(pageable);
        List<NciThesaurus> enrichedNciThesaurus = nciThesaurusRepository.findAllWithEagerRelationships(
            nciThesaurusPage.getContent().stream().map(NciThesaurus::getId).collect(Collectors.toList())
        );
        return new PageImpl<>(enrichedNciThesaurus, pageable, nciThesaurusPage.getTotalElements());
    }

    /**
     * Get one nciThesaurus by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<NciThesaurus> findOne(Long id) {
        log.debug("Request to get NciThesaurus : {}", id);
        return nciThesaurusRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the nciThesaurus by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete NciThesaurus : {}", id);
        nciThesaurusRepository.deleteById(id);
    }

    public List<NciThesaurus> searchNciThesaurus(String query) {
        return nciThesaurusRepository.searchNciThesaurus(query);
    }
}
