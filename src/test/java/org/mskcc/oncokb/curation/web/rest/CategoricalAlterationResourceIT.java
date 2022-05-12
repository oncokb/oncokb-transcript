package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.CategoricalAlteration;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.domain.enumeration.CategoricalAlterationType;
import org.mskcc.oncokb.curation.repository.CategoricalAlterationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link CategoricalAlterationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CategoricalAlterationResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final CategoricalAlterationType DEFAULT_TYPE = CategoricalAlterationType.ONCOGENIC_MUTATIONS;
    private static final CategoricalAlterationType UPDATED_TYPE = CategoricalAlterationType.GAIN_OF_FUNCTION_MUTATIONS;

    private static final AlterationType DEFAULT_ALTERATION_TYPE = AlterationType.MUTATION;
    private static final AlterationType UPDATED_ALTERATION_TYPE = AlterationType.COPY_NUMBER_ALTERATION;

    private static final String ENTITY_API_URL = "/api/categorical-alterations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private CategoricalAlterationRepository categoricalAlterationRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCategoricalAlterationMockMvc;

    private CategoricalAlteration categoricalAlteration;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoricalAlteration createEntity(EntityManager em) {
        CategoricalAlteration categoricalAlteration = new CategoricalAlteration()
            .name(DEFAULT_NAME)
            .type(DEFAULT_TYPE)
            .alterationType(DEFAULT_ALTERATION_TYPE);
        return categoricalAlteration;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoricalAlteration createUpdatedEntity(EntityManager em) {
        CategoricalAlteration categoricalAlteration = new CategoricalAlteration()
            .name(UPDATED_NAME)
            .type(UPDATED_TYPE)
            .alterationType(UPDATED_ALTERATION_TYPE);
        return categoricalAlteration;
    }

    @BeforeEach
    public void initTest() {
        categoricalAlteration = createEntity(em);
    }

    @Test
    @Transactional
    void createCategoricalAlteration() throws Exception {
        int databaseSizeBeforeCreate = categoricalAlterationRepository.findAll().size();
        // Create the CategoricalAlteration
        restCategoricalAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isCreated());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeCreate + 1);
        CategoricalAlteration testCategoricalAlteration = categoricalAlterationList.get(categoricalAlterationList.size() - 1);
        assertThat(testCategoricalAlteration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCategoricalAlteration.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testCategoricalAlteration.getAlterationType()).isEqualTo(DEFAULT_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void createCategoricalAlterationWithExistingId() throws Exception {
        // Create the CategoricalAlteration with an existing ID
        categoricalAlteration.setId(1L);

        int databaseSizeBeforeCreate = categoricalAlterationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCategoricalAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoricalAlterationRepository.findAll().size();
        // set the field null
        categoricalAlteration.setName(null);

        // Create the CategoricalAlteration, which fails.

        restCategoricalAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoricalAlterationRepository.findAll().size();
        // set the field null
        categoricalAlteration.setType(null);

        // Create the CategoricalAlteration, which fails.

        restCategoricalAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAlterationTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoricalAlterationRepository.findAll().size();
        // set the field null
        categoricalAlteration.setAlterationType(null);

        // Create the CategoricalAlteration, which fails.

        restCategoricalAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCategoricalAlterations() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        // Get all the categoricalAlterationList
        restCategoricalAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(categoricalAlteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].alterationType").value(hasItem(DEFAULT_ALTERATION_TYPE.toString())));
    }

    @Test
    @Transactional
    void getCategoricalAlteration() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        // Get the categoricalAlteration
        restCategoricalAlterationMockMvc
            .perform(get(ENTITY_API_URL_ID, categoricalAlteration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(categoricalAlteration.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.alterationType").value(DEFAULT_ALTERATION_TYPE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCategoricalAlteration() throws Exception {
        // Get the categoricalAlteration
        restCategoricalAlterationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewCategoricalAlteration() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();

        // Update the categoricalAlteration
        CategoricalAlteration updatedCategoricalAlteration = categoricalAlterationRepository.findById(categoricalAlteration.getId()).get();
        // Disconnect from session so that the updates on updatedCategoricalAlteration are not directly saved in db
        em.detach(updatedCategoricalAlteration);
        updatedCategoricalAlteration.name(UPDATED_NAME).type(UPDATED_TYPE).alterationType(UPDATED_ALTERATION_TYPE);

        restCategoricalAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCategoricalAlteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedCategoricalAlteration))
            )
            .andExpect(status().isOk());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
        CategoricalAlteration testCategoricalAlteration = categoricalAlterationList.get(categoricalAlterationList.size() - 1);
        assertThat(testCategoricalAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCategoricalAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testCategoricalAlteration.getAlterationType()).isEqualTo(UPDATED_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void putNonExistingCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, categoricalAlteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCategoricalAlterationWithPatch() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();

        // Update the categoricalAlteration using partial update
        CategoricalAlteration partialUpdatedCategoricalAlteration = new CategoricalAlteration();
        partialUpdatedCategoricalAlteration.setId(categoricalAlteration.getId());

        partialUpdatedCategoricalAlteration.type(UPDATED_TYPE);

        restCategoricalAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoricalAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCategoricalAlteration))
            )
            .andExpect(status().isOk());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
        CategoricalAlteration testCategoricalAlteration = categoricalAlterationList.get(categoricalAlterationList.size() - 1);
        assertThat(testCategoricalAlteration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCategoricalAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testCategoricalAlteration.getAlterationType()).isEqualTo(DEFAULT_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void fullUpdateCategoricalAlterationWithPatch() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();

        // Update the categoricalAlteration using partial update
        CategoricalAlteration partialUpdatedCategoricalAlteration = new CategoricalAlteration();
        partialUpdatedCategoricalAlteration.setId(categoricalAlteration.getId());

        partialUpdatedCategoricalAlteration.name(UPDATED_NAME).type(UPDATED_TYPE).alterationType(UPDATED_ALTERATION_TYPE);

        restCategoricalAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoricalAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCategoricalAlteration))
            )
            .andExpect(status().isOk());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
        CategoricalAlteration testCategoricalAlteration = categoricalAlterationList.get(categoricalAlterationList.size() - 1);
        assertThat(testCategoricalAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCategoricalAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testCategoricalAlteration.getAlterationType()).isEqualTo(UPDATED_ALTERATION_TYPE);
    }

    @Test
    @Transactional
    void patchNonExistingCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, categoricalAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCategoricalAlteration() throws Exception {
        int databaseSizeBeforeUpdate = categoricalAlterationRepository.findAll().size();
        categoricalAlteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoricalAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(categoricalAlteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoricalAlteration in the database
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCategoricalAlteration() throws Exception {
        // Initialize the database
        categoricalAlterationRepository.saveAndFlush(categoricalAlteration);

        int databaseSizeBeforeDelete = categoricalAlterationRepository.findAll().size();

        // Delete the categoricalAlteration
        restCategoricalAlterationMockMvc
            .perform(delete(ENTITY_API_URL_ID, categoricalAlteration.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<CategoricalAlteration> categoricalAlterationList = categoricalAlterationRepository.findAll();
        assertThat(categoricalAlterationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
