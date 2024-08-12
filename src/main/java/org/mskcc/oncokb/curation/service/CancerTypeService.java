package org.mskcc.oncokb.curation.service;

import com.mysql.cj.util.StringUtils;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.RelevantCancerTypeBody;
import org.mskcc.oncokb.curation.domain.RelevantCancerTypeQuery;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.util.CancerTypeUtils;
import org.mskcc.oncokb.curation.util.enumeration.RelevantCancerTypeDirection;
import org.mskcc.oncokb.curation.util.enumeration.SpecialCancerType;
import org.oncokb.client.Evidence.LevelOfEvidenceEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link CancerType}.
 */
@Service
@Transactional
public class CancerTypeService {

    private final Logger log = LoggerFactory.getLogger(CancerTypeService.class);

    private final CancerTypeRepository cancerTypeRepository;

    public CancerTypeService(CancerTypeRepository cancerTypeRepository) {
        this.cancerTypeRepository = cancerTypeRepository;
    }

    /**
     * Save a cancerType.
     *
     * @param cancerType the entity to save.
     * @return the persisted entity.
     */
    public CancerType save(CancerType cancerType) {
        log.debug("Request to save CancerType : {}", cancerType);
        return cancerTypeRepository.save(cancerType);
    }

    /**
     * Partially update a cancerType.
     *
     * @param cancerType the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CancerType> partialUpdate(CancerType cancerType) {
        log.debug("Request to partially update CancerType : {}", cancerType);

        return cancerTypeRepository
            .findById(cancerType.getId())
            .map(existingCancerType -> {
                if (cancerType.getCode() != null) {
                    existingCancerType.setCode(cancerType.getCode());
                }
                if (cancerType.getColor() != null) {
                    existingCancerType.setColor(cancerType.getColor());
                }
                if (cancerType.getLevel() != null) {
                    existingCancerType.setLevel(cancerType.getLevel());
                }
                if (cancerType.getMainType() != null) {
                    existingCancerType.setMainType(cancerType.getMainType());
                }
                if (cancerType.getSubtype() != null) {
                    existingCancerType.setSubtype(cancerType.getSubtype());
                }
                if (cancerType.getTissue() != null) {
                    existingCancerType.setTissue(cancerType.getTissue());
                }
                if (cancerType.getTumorForm() != null) {
                    existingCancerType.setTumorForm(cancerType.getTumorForm());
                }

                return existingCancerType;
            })
            .map(cancerTypeRepository::save);
    }

    /**
     * Get all the cancerTypes.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CancerType> findAll(Pageable pageable) {
        log.debug("Request to get all CancerTypes");
        return cancerTypeRepository.findAll(pageable);
    }

    /**
     * Get all the cancerTypes with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CancerType> findAllWithEagerRelationships(Pageable pageable) {
        return cancerTypeRepository.findAllWithEagerRelationships(pageable);
    }

    public List<CancerType> findAllByMainTypeIs(String maintype) {
        return cancerTypeRepository.findAllByMainTypeIs(maintype);
    }

    /**
     * Get one cancerType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CancerType> findOne(Long id) {
        log.debug("Request to get CancerType : {}", id);
        return cancerTypeRepository.findOneWithEagerRelationships(id);
    }

    @Transactional(readOnly = true)
    public Optional<CancerType> findOneByCode(String code) {
        return cancerTypeRepository.findOneByCodeIgnoreCase(code);
    }

    @Transactional(readOnly = true)
    public Optional<CancerType> findOneBySubtypeIgnoreCase(String subtype) {
        return cancerTypeRepository.findOneBySubtypeIgnoreCase(subtype);
    }

    @Transactional(readOnly = true)
    public Optional<CancerType> findByMainTypeAndSubtypeIsNull(String mainType) {
        return cancerTypeRepository.findByMainTypeAndSubtypeIsNull(mainType);
    }

    @Transactional(readOnly = true)
    public List<CancerType> getRelevantCancerTypes(String levelOfEvidence, RelevantCancerTypeBody relevantCancerTypeBody) {
        List<CancerType> cancerTypes = new ArrayList<>();
        List<RelevantCancerTypeQuery> cancerTypeQueries = relevantCancerTypeBody.getRelevantCancerTypeQueries();
        if (cancerTypeQueries == null) {
            return cancerTypes;
        } else {
            cancerTypes = getRelevantCancerTypes(levelOfEvidence, cancerTypeQueries);
        }

        List<CancerType> excludedCancerTypes = new ArrayList<>();
        List<RelevantCancerTypeQuery> excludedCancerTypeQueries = relevantCancerTypeBody.getExcludedRelevantCancerTypeQueries();
        if (excludedCancerTypeQueries != null) {
            excludedCancerTypes = getRelevantCancerTypes(levelOfEvidence, excludedCancerTypeQueries);
        }

        Set<CancerType> relevantCancerTypes = new HashSet<>(cancerTypes);
        relevantCancerTypes.removeAll(excludedCancerTypes);
        return new ArrayList<>(relevantCancerTypes);
    }

    @Transactional(readOnly = true)
    private List<CancerType> getRelevantCancerTypes(String levelOfEvidence, List<RelevantCancerTypeQuery> cancerTypeQueries) {
        boolean isLevelBased = levelOfEvidence != null;
        RelevantCancerTypeDirection direction = isLevelBased && levelOfEvidence.equals(LevelOfEvidenceEnum.LEVEL_DX1.getValue())
            ? RelevantCancerTypeDirection.UPWARD
            : RelevantCancerTypeDirection.DOWNWARD;
        Set<CancerType> relevantCancerTypes = cancerTypeQueries
            .stream()
            .map(query -> {
                if (StringUtils.isNullOrEmpty(query.getCode())) {
                    List<CancerType> relevant = findRelevantCancerTypes(query.getMainType(), true, direction);
                    if (isLevelBased) {
                        return relevant.stream().filter(type -> type.getLevel() >= 0).collect(Collectors.toSet());
                    } else {
                        return relevant;
                    }
                } else {
                    Set<CancerType> relevant = findRelevantCancerTypes(query.getCode(), false, direction)
                        .stream()
                        .filter(type -> type.getLevel() > 0)
                        .collect(Collectors.toSet());
                    if (isLevelBased) {
                        return relevant.stream().filter(type -> type.getLevel() > 0).collect(Collectors.toSet());
                    } else {
                        return relevant;
                    }
                }
            })
            .flatMap(Collection::stream)
            .collect(Collectors.toSet());

        return new ArrayList<>(relevantCancerTypes);
    }

    public List<CancerType> findRelevantCancerTypes(String cancerType, Boolean isMainType, RelevantCancerTypeDirection direction) {
        SpecialCancerType specialCancerType = SpecialCancerType.getByTumorType(cancerType);
        if (specialCancerType != null) {
            return findRelevantCancerTypesForSpecialCancerTypes(specialCancerType, direction);
        }

        LinkedHashSet<CancerType> mappedCancerTypes = new LinkedHashSet<>();
        CancerType matchedCancerType = null;

        if (isMainType != Boolean.TRUE) {
            Optional<CancerType> match = cancerTypeRepository.findOneByCodeIgnoreCase(cancerType);
            if (match.isPresent()) {
                matchedCancerType = match.orElseThrow();
            } else {
                match = cancerTypeRepository.findOneBySubtypeIgnoreCase(cancerType);
                if (match.isPresent()) {
                    matchedCancerType = match.orElseThrow();
                }
            }
        }

        String mainTypeName = cancerType;
        if (matchedCancerType != null) {
            mappedCancerTypes.add(matchedCancerType);
            mainTypeName = matchedCancerType.getMainType();
        }

        Optional<CancerType> matchedMainType = cancerTypeRepository.findOneByMainTypeIgnoreCaseAndCodeIsNull(mainTypeName);
        if (matchedMainType.isPresent() && direction.equals(RelevantCancerTypeDirection.UPWARD)) {
            mappedCancerTypes.add(matchedMainType.orElseThrow());
        }

        if (direction.equals(RelevantCancerTypeDirection.UPWARD)) {
            if (matchedCancerType != null) {
                mappedCancerTypes.addAll(CancerTypeUtils.getParentTumorTypes(matchedCancerType, true));
            }
        } else {
            if (matchedCancerType != null) {
                mappedCancerTypes.addAll(CancerTypeUtils.getChildTumorTypes(matchedCancerType, true));
            } else if (matchedMainType.isPresent()) {
                mappedCancerTypes.addAll(cancerTypeRepository.findAllByMainTypeIs(matchedMainType.orElseThrow().getMainType()));
            }
        }

        if (CancerTypeUtils.hasSolidTumor(new HashSet<>(mappedCancerTypes))) {
            Optional<CancerType> allSolidTumors = cancerTypeRepository.findOneByMainTypeIgnoreCaseAndCodeIsNull(
                SpecialCancerType.ALL_SOLID_TUMORS.getTumorType()
            );
            if (allSolidTumors.isPresent()) {
                mappedCancerTypes.add(allSolidTumors.orElseThrow());
            }
        }

        if (CancerTypeUtils.hasLiquidTumor(new HashSet<>(mappedCancerTypes))) {
            Optional<CancerType> allLiquidTumors = cancerTypeRepository.findOneByMainTypeIgnoreCaseAndCodeIsNull(
                SpecialCancerType.ALL_LIQUID_TUMORS.getTumorType()
            );
            if (allLiquidTumors.isPresent()) {
                mappedCancerTypes.add(allLiquidTumors.orElseThrow());
            }
        }

        Optional<CancerType> allTumors = cancerTypeRepository.findOneByMainTypeIgnoreCaseAndCodeIsNull(
            SpecialCancerType.ALL_TUMORS.getTumorType()
        );
        if (allTumors.isPresent()) {
            mappedCancerTypes.add(allTumors.orElseThrow());
        }

        List<CancerType> relevantCancerTypes = new ArrayList<>(new LinkedHashSet<>(mappedCancerTypes));
        CancerTypeUtils.sortByLevel(relevantCancerTypes);
        return relevantCancerTypes;
    }

    public List<CancerType> findRelevantCancerTypesForSpecialCancerTypes(
        SpecialCancerType specialCancerType,
        RelevantCancerTypeDirection direction
    ) {
        List<CancerType> relevantCancerTypes = new ArrayList<>();
        if (specialCancerType == null) {
            return relevantCancerTypes;
        }

        Optional<CancerType> special = cancerTypeRepository.findOneByCodeIgnoreCase(specialCancerType.name());
        if (special.isPresent()) {
            relevantCancerTypes.add(special.orElseThrow());
        }

        if (direction.equals(RelevantCancerTypeDirection.UPWARD)) {
            switch (specialCancerType) {
                case ALL_SOLID_TUMORS:
                case ALL_LIQUID_TUMORS:
                    Optional<CancerType> allTumors = cancerTypeRepository.findOneByCodeIgnoreCase(SpecialCancerType.ALL_TUMORS.name());
                    if (allTumors.isPresent()) {
                        relevantCancerTypes.add(allTumors.orElseThrow());
                    }
                    break;
                default:
                    break;
            }
        } else if (direction.equals(RelevantCancerTypeDirection.DOWNWARD)) {
            switch (specialCancerType) {
                case ALL_SOLID_TUMORS: // add all non-special that are solid or mixed
                    relevantCancerTypes.addAll(
                        cancerTypeRepository
                            .findByTumorFormIn(Arrays.asList(TumorForm.SOLID, TumorForm.MIXED))
                            .stream()
                            .filter(cancerType -> cancerType.getLevel() >= 0)
                            .collect(Collectors.toSet())
                    );
                    break;
                case ALL_LIQUID_TUMORS: // add all non-special that are liquid or mixed
                    relevantCancerTypes.addAll(
                        cancerTypeRepository
                            .findByTumorFormIn(Arrays.asList(TumorForm.LIQUID, TumorForm.MIXED))
                            .stream()
                            .filter(cancerType -> cancerType.getLevel() >= 0)
                            .collect(Collectors.toSet())
                    );
                    break;
                case ALL_TUMORS: // add all non-special and all solid tumors and all liquid tumors
                    relevantCancerTypes.addAll(
                        cancerTypeRepository
                            .findAll()
                            .stream()
                            .filter(
                                cancerType ->
                                    cancerType.getLevel() >= 0 ||
                                    cancerType.getMainType().equals(SpecialCancerType.ALL_SOLID_TUMORS.getTumorType()) ||
                                    cancerType.getMainType().equals(SpecialCancerType.ALL_LIQUID_TUMORS.getTumorType())
                            )
                            .collect(Collectors.toSet())
                    );
                    break;
                default:
                    break;
            }
        }
        return relevantCancerTypes;
    }

    /**
     * Delete the cancerType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete CancerType : {}", id);
        cancerTypeRepository.deleteById(id);
    }
}
