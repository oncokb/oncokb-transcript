package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Rule;
import org.mskcc.oncokb.curation.repository.RuleRepository;
import org.mskcc.oncokb.curation.service.RuleService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Rule}.
 */
@RestController
@RequestMapping("/api")
public class RuleResource {

    private final Logger log = LoggerFactory.getLogger(RuleResource.class);

    private static final String ENTITY_NAME = "rule";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RuleService ruleService;

    private final RuleRepository ruleRepository;

    public RuleResource(RuleService ruleService, RuleRepository ruleRepository) {
        this.ruleService = ruleService;
        this.ruleRepository = ruleRepository;
    }

    /**
     * {@code POST  /rules} : Create a new rule.
     *
     * @param rule the rule to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new rule, or with status {@code 400 (Bad Request)} if the rule has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/rules")
    public ResponseEntity<Rule> createRule(@Valid @RequestBody Rule rule) throws URISyntaxException {
        log.debug("REST request to save Rule : {}", rule);
        if (rule.getId() != null) {
            throw new BadRequestAlertException("A new rule cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Rule result = ruleService.save(rule);
        return ResponseEntity
            .created(new URI("/api/rules/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /rules/:id} : Updates an existing rule.
     *
     * @param id the id of the rule to save.
     * @param rule the rule to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated rule,
     * or with status {@code 400 (Bad Request)} if the rule is not valid,
     * or with status {@code 500 (Internal Server Error)} if the rule couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/rules/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Rule rule)
        throws URISyntaxException {
        log.debug("REST request to update Rule : {}, {}", id, rule);
        if (rule.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, rule.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ruleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Rule result = ruleService.save(rule);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, rule.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /rules/:id} : Partial updates given fields of an existing rule, field will ignore if it is null
     *
     * @param id the id of the rule to save.
     * @param rule the rule to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated rule,
     * or with status {@code 400 (Bad Request)} if the rule is not valid,
     * or with status {@code 404 (Not Found)} if the rule is not found,
     * or with status {@code 500 (Internal Server Error)} if the rule couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/rules/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Rule> partialUpdateRule(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Rule rule
    ) throws URISyntaxException {
        log.debug("REST request to partial update Rule partially : {}, {}", id, rule);
        if (rule.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, rule.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ruleRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Rule> result = ruleService.partialUpdate(rule);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, rule.getId().toString())
        );
    }

    /**
     * {@code GET  /rules} : get all the rules.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of rules in body.
     */
    @GetMapping("/rules")
    public List<Rule> getAllRules() {
        log.debug("REST request to get all Rules");
        return ruleService.findAll();
    }

    /**
     * {@code GET  /rules/:id} : get the "id" rule.
     *
     * @param id the id of the rule to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the rule, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/rules/{id}")
    public ResponseEntity<Rule> getRule(@PathVariable Long id) {
        log.debug("REST request to get Rule : {}", id);
        Optional<Rule> rule = ruleService.findOne(id);
        return ResponseUtil.wrapOrNotFound(rule);
    }

    /**
     * {@code DELETE  /rules/:id} : delete the "id" rule.
     *
     * @param id the id of the rule to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        log.debug("REST request to delete Rule : {}", id);
        ruleService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
