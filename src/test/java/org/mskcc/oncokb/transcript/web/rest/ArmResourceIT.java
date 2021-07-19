package org.mskcc.oncokb.transcript.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
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
import org.mskcc.oncokb.transcript.IntegrationTest;
import org.mskcc.oncokb.transcript.domain.Arm;
import org.mskcc.oncokb.transcript.repository.ArmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link ArmResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ArmResourceIT {

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/arms";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ArmRepository armRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restArmMockMvc;

    private Arm arm;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Arm createEntity(EntityManager em) {
        Arm arm = new Arm().description(DEFAULT_DESCRIPTION);
        return arm;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Arm createUpdatedEntity(EntityManager em) {
        Arm arm = new Arm().description(UPDATED_DESCRIPTION);
        return arm;
    }

    @BeforeEach
    public void initTest() {
        arm = createEntity(em);
    }

    @Test
    @Transactional
    void createArm() throws Exception {
        int databaseSizeBeforeCreate = armRepository.findAll().size();
        // Create the Arm
        restArmMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(arm)))
            .andExpect(status().isCreated());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeCreate + 1);
        Arm testArm = armList.get(armList.size() - 1);
        assertThat(testArm.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createArmWithExistingId() throws Exception {
        // Create the Arm with an existing ID
        arm.setId(1L);

        int databaseSizeBeforeCreate = armRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restArmMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(arm)))
            .andExpect(status().isBadRequest());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllArms() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        // Get all the armList
        restArmMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(arm.getId().intValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    void getArm() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        // Get the arm
        restArmMockMvc
            .perform(get(ENTITY_API_URL_ID, arm.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(arm.getId().intValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingArm() throws Exception {
        // Get the arm
        restArmMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewArm() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        int databaseSizeBeforeUpdate = armRepository.findAll().size();

        // Update the arm
        Arm updatedArm = armRepository.findById(arm.getId()).get();
        // Disconnect from session so that the updates on updatedArm are not directly saved in db
        em.detach(updatedArm);
        updatedArm.description(UPDATED_DESCRIPTION);

        restArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedArm.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedArm))
            )
            .andExpect(status().isOk());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
        Arm testArm = armList.get(armList.size() - 1);
        assertThat(testArm.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, arm.getId()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(arm))
            )
            .andExpect(status().isBadRequest());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(arm))
            )
            .andExpect(status().isBadRequest());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(arm)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateArmWithPatch() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        int databaseSizeBeforeUpdate = armRepository.findAll().size();

        // Update the arm using partial update
        Arm partialUpdatedArm = new Arm();
        partialUpdatedArm.setId(arm.getId());

        partialUpdatedArm.description(UPDATED_DESCRIPTION);

        restArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArm.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArm))
            )
            .andExpect(status().isOk());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
        Arm testArm = armList.get(armList.size() - 1);
        assertThat(testArm.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateArmWithPatch() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        int databaseSizeBeforeUpdate = armRepository.findAll().size();

        // Update the arm using partial update
        Arm partialUpdatedArm = new Arm();
        partialUpdatedArm.setId(arm.getId());

        partialUpdatedArm.description(UPDATED_DESCRIPTION);

        restArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArm.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArm))
            )
            .andExpect(status().isOk());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
        Arm testArm = armList.get(armList.size() - 1);
        assertThat(testArm.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, arm.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(arm))
            )
            .andExpect(status().isBadRequest());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(arm))
            )
            .andExpect(status().isBadRequest());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamArm() throws Exception {
        int databaseSizeBeforeUpdate = armRepository.findAll().size();
        arm.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArmMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(arm)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Arm in the database
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteArm() throws Exception {
        // Initialize the database
        armRepository.saveAndFlush(arm);

        int databaseSizeBeforeDelete = armRepository.findAll().size();

        // Delete the arm
        restArmMockMvc.perform(delete(ENTITY_API_URL_ID, arm.getId()).accept(MediaType.APPLICATION_JSON)).andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Arm> armList = armRepository.findAll();
        assertThat(armList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
