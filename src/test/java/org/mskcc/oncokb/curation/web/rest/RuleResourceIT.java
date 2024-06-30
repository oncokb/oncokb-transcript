package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Rule;
import org.mskcc.oncokb.curation.repository.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link RuleResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class RuleResourceIT {

    private static final String DEFAULT_ENTITY = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY = "BBBBBBBBBB";

    private static final String DEFAULT_RULE = "AAAAAAAAAA";
    private static final String UPDATED_RULE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/rules";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRuleMockMvc;

    private Rule rule;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Rule createEntity(EntityManager em) {
        Rule rule = new Rule().entity(DEFAULT_ENTITY).rule(DEFAULT_RULE).name(DEFAULT_NAME);
        return rule;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Rule createUpdatedEntity(EntityManager em) {
        Rule rule = new Rule().entity(UPDATED_ENTITY).rule(UPDATED_RULE).name(UPDATED_NAME);
        return rule;
    }

    @BeforeEach
    public void initTest() {
        rule = createEntity(em);
    }

    @Test
    @Transactional
    void createRule() throws Exception {
        int databaseSizeBeforeCreate = ruleRepository.findAll().size();
        // Create the Rule
        restRuleMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isCreated());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeCreate + 1);
        Rule testRule = ruleList.get(ruleList.size() - 1);
        assertThat(testRule.getEntity()).isEqualTo(DEFAULT_ENTITY);
        assertThat(testRule.getRule()).isEqualTo(DEFAULT_RULE);
        assertThat(testRule.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createRuleWithExistingId() throws Exception {
        // Create the Rule with an existing ID
        rule.setId(1L);

        int databaseSizeBeforeCreate = ruleRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRuleMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntityIsRequired() throws Exception {
        int databaseSizeBeforeTest = ruleRepository.findAll().size();
        // set the field null
        rule.setEntity(null);

        // Create the Rule, which fails.

        restRuleMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRules() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        // Get all the ruleList
        restRuleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(rule.getId().intValue())))
            .andExpect(jsonPath("$.[*].entity").value(hasItem(DEFAULT_ENTITY)))
            .andExpect(jsonPath("$.[*].rule").value(hasItem(DEFAULT_RULE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @Test
    @Transactional
    void getRule() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        // Get the rule
        restRuleMockMvc
            .perform(get(ENTITY_API_URL_ID, rule.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(rule.getId().intValue()))
            .andExpect(jsonPath("$.entity").value(DEFAULT_ENTITY))
            .andExpect(jsonPath("$.rule").value(DEFAULT_RULE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingRule() throws Exception {
        // Get the rule
        restRuleMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewRule() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();

        // Update the rule
        Rule updatedRule = ruleRepository.findById(rule.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRule are not directly saved in db
        em.detach(updatedRule);
        updatedRule.entity(UPDATED_ENTITY).rule(UPDATED_RULE).name(UPDATED_NAME);

        restRuleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedRule.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedRule))
            )
            .andExpect(status().isOk());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
        Rule testRule = ruleList.get(ruleList.size() - 1);
        assertThat(testRule.getEntity()).isEqualTo(UPDATED_ENTITY);
        assertThat(testRule.getRule()).isEqualTo(UPDATED_RULE);
        assertThat(testRule.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, rule.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRuleWithPatch() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();

        // Update the rule using partial update
        Rule partialUpdatedRule = new Rule();
        partialUpdatedRule.setId(rule.getId());

        partialUpdatedRule.rule(UPDATED_RULE);

        restRuleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRule.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedRule))
            )
            .andExpect(status().isOk());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
        Rule testRule = ruleList.get(ruleList.size() - 1);
        assertThat(testRule.getEntity()).isEqualTo(DEFAULT_ENTITY);
        assertThat(testRule.getRule()).isEqualTo(UPDATED_RULE);
        assertThat(testRule.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateRuleWithPatch() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();

        // Update the rule using partial update
        Rule partialUpdatedRule = new Rule();
        partialUpdatedRule.setId(rule.getId());

        partialUpdatedRule.entity(UPDATED_ENTITY).rule(UPDATED_RULE).name(UPDATED_NAME);

        restRuleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRule.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedRule))
            )
            .andExpect(status().isOk());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
        Rule testRule = ruleList.get(ruleList.size() - 1);
        assertThat(testRule.getEntity()).isEqualTo(UPDATED_ENTITY);
        assertThat(testRule.getRule()).isEqualTo(UPDATED_RULE);
        assertThat(testRule.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, rule.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRule() throws Exception {
        int databaseSizeBeforeUpdate = ruleRepository.findAll().size();
        rule.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRuleMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(rule))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Rule in the database
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRule() throws Exception {
        // Initialize the database
        ruleRepository.saveAndFlush(rule);

        int databaseSizeBeforeDelete = ruleRepository.findAll().size();

        // Delete the rule
        restRuleMockMvc
            .perform(delete(ENTITY_API_URL_ID, rule.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Rule> ruleList = ruleRepository.findAll();
        assertThat(ruleList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
