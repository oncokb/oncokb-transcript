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
import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.mskcc.oncokb.curation.repository.LevelOfEvidenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link LevelOfEvidenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class LevelOfEvidenceResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_LEVEL = "AAAAAAAAAA";
    private static final String UPDATED_LEVEL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/level-of-evidences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private LevelOfEvidenceRepository levelOfEvidenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLevelOfEvidenceMockMvc;

    private LevelOfEvidence levelOfEvidence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LevelOfEvidence createEntity(EntityManager em) {
        LevelOfEvidence levelOfEvidence = new LevelOfEvidence().type(DEFAULT_TYPE).level(DEFAULT_LEVEL);
        return levelOfEvidence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LevelOfEvidence createUpdatedEntity(EntityManager em) {
        LevelOfEvidence levelOfEvidence = new LevelOfEvidence().type(UPDATED_TYPE).level(UPDATED_LEVEL);
        return levelOfEvidence;
    }

    @BeforeEach
    public void initTest() {
        levelOfEvidence = createEntity(em);
    }

    @Test
    @Transactional
    void createLevelOfEvidence() throws Exception {
        int databaseSizeBeforeCreate = levelOfEvidenceRepository.findAll().size();
        // Create the LevelOfEvidence
        restLevelOfEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isCreated());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeCreate + 1);
        LevelOfEvidence testLevelOfEvidence = levelOfEvidenceList.get(levelOfEvidenceList.size() - 1);
        assertThat(testLevelOfEvidence.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testLevelOfEvidence.getLevel()).isEqualTo(DEFAULT_LEVEL);
    }

    @Test
    @Transactional
    void createLevelOfEvidenceWithExistingId() throws Exception {
        // Create the LevelOfEvidence with an existing ID
        levelOfEvidence.setId(1L);

        int databaseSizeBeforeCreate = levelOfEvidenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLevelOfEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = levelOfEvidenceRepository.findAll().size();
        // set the field null
        levelOfEvidence.setType(null);

        // Create the LevelOfEvidence, which fails.

        restLevelOfEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLevelIsRequired() throws Exception {
        int databaseSizeBeforeTest = levelOfEvidenceRepository.findAll().size();
        // set the field null
        levelOfEvidence.setLevel(null);

        // Create the LevelOfEvidence, which fails.

        restLevelOfEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllLevelOfEvidences() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        // Get all the levelOfEvidenceList
        restLevelOfEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(levelOfEvidence.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].level").value(hasItem(DEFAULT_LEVEL)));
    }

    @Test
    @Transactional
    void getLevelOfEvidence() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        // Get the levelOfEvidence
        restLevelOfEvidenceMockMvc
            .perform(get(ENTITY_API_URL_ID, levelOfEvidence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(levelOfEvidence.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.level").value(DEFAULT_LEVEL));
    }

    @Test
    @Transactional
    void getNonExistingLevelOfEvidence() throws Exception {
        // Get the levelOfEvidence
        restLevelOfEvidenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewLevelOfEvidence() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();

        // Update the levelOfEvidence
        LevelOfEvidence updatedLevelOfEvidence = levelOfEvidenceRepository.findById(levelOfEvidence.getId()).get();
        // Disconnect from session so that the updates on updatedLevelOfEvidence are not directly saved in db
        em.detach(updatedLevelOfEvidence);
        updatedLevelOfEvidence.type(UPDATED_TYPE).level(UPDATED_LEVEL);

        restLevelOfEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedLevelOfEvidence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedLevelOfEvidence))
            )
            .andExpect(status().isOk());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
        LevelOfEvidence testLevelOfEvidence = levelOfEvidenceList.get(levelOfEvidenceList.size() - 1);
        assertThat(testLevelOfEvidence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testLevelOfEvidence.getLevel()).isEqualTo(UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void putNonExistingLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, levelOfEvidence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLevelOfEvidenceWithPatch() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();

        // Update the levelOfEvidence using partial update
        LevelOfEvidence partialUpdatedLevelOfEvidence = new LevelOfEvidence();
        partialUpdatedLevelOfEvidence.setId(levelOfEvidence.getId());

        partialUpdatedLevelOfEvidence.type(UPDATED_TYPE).level(UPDATED_LEVEL);

        restLevelOfEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLevelOfEvidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedLevelOfEvidence))
            )
            .andExpect(status().isOk());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
        LevelOfEvidence testLevelOfEvidence = levelOfEvidenceList.get(levelOfEvidenceList.size() - 1);
        assertThat(testLevelOfEvidence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testLevelOfEvidence.getLevel()).isEqualTo(UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void fullUpdateLevelOfEvidenceWithPatch() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();

        // Update the levelOfEvidence using partial update
        LevelOfEvidence partialUpdatedLevelOfEvidence = new LevelOfEvidence();
        partialUpdatedLevelOfEvidence.setId(levelOfEvidence.getId());

        partialUpdatedLevelOfEvidence.type(UPDATED_TYPE).level(UPDATED_LEVEL);

        restLevelOfEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLevelOfEvidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedLevelOfEvidence))
            )
            .andExpect(status().isOk());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
        LevelOfEvidence testLevelOfEvidence = levelOfEvidenceList.get(levelOfEvidenceList.size() - 1);
        assertThat(testLevelOfEvidence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testLevelOfEvidence.getLevel()).isEqualTo(UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void patchNonExistingLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, levelOfEvidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLevelOfEvidence() throws Exception {
        int databaseSizeBeforeUpdate = levelOfEvidenceRepository.findAll().size();
        levelOfEvidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLevelOfEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(levelOfEvidence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the LevelOfEvidence in the database
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLevelOfEvidence() throws Exception {
        // Initialize the database
        levelOfEvidenceRepository.saveAndFlush(levelOfEvidence);

        int databaseSizeBeforeDelete = levelOfEvidenceRepository.findAll().size();

        // Delete the levelOfEvidence
        restLevelOfEvidenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, levelOfEvidence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<LevelOfEvidence> levelOfEvidenceList = levelOfEvidenceRepository.findAll();
        assertThat(levelOfEvidenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
