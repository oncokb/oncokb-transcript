package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Rule;
import org.mskcc.oncokb.curation.repository.RuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Rule}.
 */
@Service
@Transactional
public class RuleService {

    private final Logger log = LoggerFactory.getLogger(RuleService.class);

    private final RuleRepository ruleRepository;

    public RuleService(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    /**
     * Save a rule.
     *
     * @param rule the entity to save.
     * @return the persisted entity.
     */
    public Rule save(Rule rule) {
        log.debug("Request to save Rule : {}", rule);
        return ruleRepository.save(rule);
    }

    /**
     * Partially update a rule.
     *
     * @param rule the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Rule> partialUpdate(Rule rule) {
        log.debug("Request to partially update Rule : {}", rule);

        return ruleRepository
            .findById(rule.getId())
            .map(existingRule -> {
                if (rule.getEntity() != null) {
                    existingRule.setEntity(rule.getEntity());
                }
                if (rule.getRule() != null) {
                    existingRule.setRule(rule.getRule());
                }
                if (rule.getName() != null) {
                    existingRule.setName(rule.getName());
                }

                return existingRule;
            })
            .map(ruleRepository::save);
    }

    /**
     * Get all the rules.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Rule> findAll() {
        log.debug("Request to get all Rules");
        return ruleRepository.findAll();
    }

    /**
     * Get one rule by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Rule> findOne(Long id) {
        log.debug("Request to get Rule : {}", id);
        return ruleRepository.findById(id);
    }

    /**
     * Delete the rule by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Rule : {}", id);
        ruleRepository.deleteById(id);
    }
}
