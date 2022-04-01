package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
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
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.repository.CompanionDiagnosticDeviceRepository;
import org.mskcc.oncokb.curation.service.CompanionDiagnosticDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link CompanionDiagnosticDeviceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CompanionDiagnosticDeviceResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_MANUFACTURER = "AAAAAAAAAA";
    private static final String UPDATED_MANUFACTURER = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/companion-diagnostic-devices";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;

    @Mock
    private CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepositoryMock;

    @Mock
    private CompanionDiagnosticDeviceService companionDiagnosticDeviceServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCompanionDiagnosticDeviceMockMvc;

    private CompanionDiagnosticDevice companionDiagnosticDevice;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanionDiagnosticDevice createEntity(EntityManager em) {
        CompanionDiagnosticDevice companionDiagnosticDevice = new CompanionDiagnosticDevice()
            .name(DEFAULT_NAME)
            .manufacturer(DEFAULT_MANUFACTURER);
        return companionDiagnosticDevice;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanionDiagnosticDevice createUpdatedEntity(EntityManager em) {
        CompanionDiagnosticDevice companionDiagnosticDevice = new CompanionDiagnosticDevice()
            .name(UPDATED_NAME)
            .manufacturer(UPDATED_MANUFACTURER);
        return companionDiagnosticDevice;
    }

    @BeforeEach
    public void initTest() {
        companionDiagnosticDevice = createEntity(em);
    }

    @Test
    @Transactional
    void createCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeCreate = companionDiagnosticDeviceRepository.findAll().size();
        // Create the CompanionDiagnosticDevice
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isCreated());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeCreate + 1);
        CompanionDiagnosticDevice testCompanionDiagnosticDevice = companionDiagnosticDeviceList.get(
            companionDiagnosticDeviceList.size() - 1
        );
        assertThat(testCompanionDiagnosticDevice.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCompanionDiagnosticDevice.getManufacturer()).isEqualTo(DEFAULT_MANUFACTURER);
    }

    @Test
    @Transactional
    void createCompanionDiagnosticDeviceWithExistingId() throws Exception {
        // Create the CompanionDiagnosticDevice with an existing ID
        companionDiagnosticDevice.setId(1L);

        int databaseSizeBeforeCreate = companionDiagnosticDeviceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = companionDiagnosticDeviceRepository.findAll().size();
        // set the field null
        companionDiagnosticDevice.setName(null);

        // Create the CompanionDiagnosticDevice, which fails.

        restCompanionDiagnosticDeviceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkManufacturerIsRequired() throws Exception {
        int databaseSizeBeforeTest = companionDiagnosticDeviceRepository.findAll().size();
        // set the field null
        companionDiagnosticDevice.setManufacturer(null);

        // Create the CompanionDiagnosticDevice, which fails.

        restCompanionDiagnosticDeviceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCompanionDiagnosticDevices() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        // Get all the companionDiagnosticDeviceList
        restCompanionDiagnosticDeviceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(companionDiagnosticDevice.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].manufacturer").value(hasItem(DEFAULT_MANUFACTURER)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCompanionDiagnosticDevicesWithEagerRelationshipsIsEnabled() throws Exception {
        when(companionDiagnosticDeviceServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCompanionDiagnosticDeviceMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(companionDiagnosticDeviceServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCompanionDiagnosticDevicesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(companionDiagnosticDeviceServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCompanionDiagnosticDeviceMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(companionDiagnosticDeviceServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getCompanionDiagnosticDevice() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        // Get the companionDiagnosticDevice
        restCompanionDiagnosticDeviceMockMvc
            .perform(get(ENTITY_API_URL_ID, companionDiagnosticDevice.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(companionDiagnosticDevice.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.manufacturer").value(DEFAULT_MANUFACTURER));
    }

    @Test
    @Transactional
    void getNonExistingCompanionDiagnosticDevice() throws Exception {
        // Get the companionDiagnosticDevice
        restCompanionDiagnosticDeviceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewCompanionDiagnosticDevice() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();

        // Update the companionDiagnosticDevice
        CompanionDiagnosticDevice updatedCompanionDiagnosticDevice = companionDiagnosticDeviceRepository
            .findById(companionDiagnosticDevice.getId())
            .get();
        // Disconnect from session so that the updates on updatedCompanionDiagnosticDevice are not directly saved in db
        em.detach(updatedCompanionDiagnosticDevice);
        updatedCompanionDiagnosticDevice.name(UPDATED_NAME).manufacturer(UPDATED_MANUFACTURER);

        restCompanionDiagnosticDeviceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCompanionDiagnosticDevice.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedCompanionDiagnosticDevice))
            )
            .andExpect(status().isOk());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
        CompanionDiagnosticDevice testCompanionDiagnosticDevice = companionDiagnosticDeviceList.get(
            companionDiagnosticDeviceList.size() - 1
        );
        assertThat(testCompanionDiagnosticDevice.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCompanionDiagnosticDevice.getManufacturer()).isEqualTo(UPDATED_MANUFACTURER);
    }

    @Test
    @Transactional
    void putNonExistingCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, companionDiagnosticDevice.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCompanionDiagnosticDeviceWithPatch() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();

        // Update the companionDiagnosticDevice using partial update
        CompanionDiagnosticDevice partialUpdatedCompanionDiagnosticDevice = new CompanionDiagnosticDevice();
        partialUpdatedCompanionDiagnosticDevice.setId(companionDiagnosticDevice.getId());

        partialUpdatedCompanionDiagnosticDevice.manufacturer(UPDATED_MANUFACTURER);

        restCompanionDiagnosticDeviceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCompanionDiagnosticDevice.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCompanionDiagnosticDevice))
            )
            .andExpect(status().isOk());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
        CompanionDiagnosticDevice testCompanionDiagnosticDevice = companionDiagnosticDeviceList.get(
            companionDiagnosticDeviceList.size() - 1
        );
        assertThat(testCompanionDiagnosticDevice.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCompanionDiagnosticDevice.getManufacturer()).isEqualTo(UPDATED_MANUFACTURER);
    }

    @Test
    @Transactional
    void fullUpdateCompanionDiagnosticDeviceWithPatch() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();

        // Update the companionDiagnosticDevice using partial update
        CompanionDiagnosticDevice partialUpdatedCompanionDiagnosticDevice = new CompanionDiagnosticDevice();
        partialUpdatedCompanionDiagnosticDevice.setId(companionDiagnosticDevice.getId());

        partialUpdatedCompanionDiagnosticDevice.name(UPDATED_NAME).manufacturer(UPDATED_MANUFACTURER);

        restCompanionDiagnosticDeviceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCompanionDiagnosticDevice.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCompanionDiagnosticDevice))
            )
            .andExpect(status().isOk());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
        CompanionDiagnosticDevice testCompanionDiagnosticDevice = companionDiagnosticDeviceList.get(
            companionDiagnosticDeviceList.size() - 1
        );
        assertThat(testCompanionDiagnosticDevice.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCompanionDiagnosticDevice.getManufacturer()).isEqualTo(UPDATED_MANUFACTURER);
    }

    @Test
    @Transactional
    void patchNonExistingCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, companionDiagnosticDevice.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCompanionDiagnosticDevice() throws Exception {
        int databaseSizeBeforeUpdate = companionDiagnosticDeviceRepository.findAll().size();
        companionDiagnosticDevice.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanionDiagnosticDeviceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(companionDiagnosticDevice))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CompanionDiagnosticDevice in the database
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCompanionDiagnosticDevice() throws Exception {
        // Initialize the database
        companionDiagnosticDeviceRepository.saveAndFlush(companionDiagnosticDevice);

        int databaseSizeBeforeDelete = companionDiagnosticDeviceRepository.findAll().size();

        // Delete the companionDiagnosticDevice
        restCompanionDiagnosticDeviceMockMvc
            .perform(delete(ENTITY_API_URL_ID, companionDiagnosticDevice.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<CompanionDiagnosticDevice> companionDiagnosticDeviceList = companionDiagnosticDeviceRepository.findAll();
        assertThat(companionDiagnosticDeviceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
