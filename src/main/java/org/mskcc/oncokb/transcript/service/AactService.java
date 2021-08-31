package org.mskcc.oncokb.transcript.service;

import java.io.IOException;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import java.util.Date;
import java.util.stream.Collectors;

import com.google.gson.Gson;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.AddressComponent;
import com.google.maps.model.AddressComponentType;
import com.google.maps.model.ComponentFilter;
import com.google.maps.model.GeocodingResult;
import jodd.util.StringUtil;
import org.mskcc.oncokb.transcript.OncokbTranscriptApp;
import org.mskcc.oncokb.transcript.config.ApplicationProperties;
import org.mskcc.oncokb.transcript.config.model.AactConfig;
import org.mskcc.oncokb.transcript.domain.ClinicalTrial;
import org.mskcc.oncokb.transcript.domain.Site;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;

@Service
public class AactService {

    private static final Logger log = LoggerFactory.getLogger(OncokbTranscriptApp.class);

    ApplicationProperties applicationProperties;
    SiteService siteService;
    ClinicalTrialService clinicalTrialService;
    GeoApiContext geoApiContext;

    final String AACT_URL = "aact-db.ctti-clinicaltrials.org";
    final int AACT_PORT = 5432;
    final String AACT_DB_NAME = "aact";
    final String AACT_CONNECTION_STR = "jdbc:postgresql://" + AACT_URL + ":" + AACT_PORT + "/" + AACT_DB_NAME;

    public AactService(ApplicationProperties applicationProperties, SiteService siteService, ClinicalTrialService clinicalTrialService) throws Exception {
        this.applicationProperties = applicationProperties;
        this.siteService = siteService;
        this.clinicalTrialService = clinicalTrialService;

        geoApiContext = new GeoApiContext.Builder()
            .apiKey(applicationProperties.getGoogleCloud().getApiKey())
            .build();
    }

    @PreDestroy
    public void preDestroy() throws IOException {
        geoApiContext.close();
    }

    private Connection getAactConnection() throws Exception {
        AactConfig aactConfig = applicationProperties.getAact();
        if (StringUtil.isNotEmpty(aactConfig.getUsername()) && StringUtil.isNotEmpty(aactConfig.getPassword())) {
            try {
                return DriverManager.getConnection(AACT_CONNECTION_STR, aactConfig.getUsername(), aactConfig.getPassword());
            } catch (SQLException throwables) {
                throwables.printStackTrace();
                throw new Exception("AACT Connection Error", throwables);
            }
        } else {
            throw new Exception("AACT u/p need to be added.");
        }
    }

    public void fetchLatestTrials() throws Exception {
        // Step 1 - Get a list of cancer related mesh terms, qualifier C04
        Set<String> meshTerms = getMeshTerms();

        Set<String> filteredTerms = meshTerms.stream().filter(meshTerm -> meshTerm.contains(",")).collect(Collectors.toSet());
        // Step 2 - Get a list of NCT IDs from browse_conditions where mesh_term comes from the step 1
        Set<String> nctIds = getNctIdsByMeshTerms(filteredTerms);

        // Step 3 - Get the trials using the list above
        nctIds = getTrials(nctIds);

        // Step 4 - Get interventions -> arm

        /*
        select dg.id, dg.nct_id, i.id, i.intervention_type, i.name
        from design_group_interventions dgi,
             design_groups dg,
             interventions i
        where dgi.design_group_id = dg.id
          and i.id = dgi.intervention_id
          and dg.nct_id = 'NCT02465060';
        */

        // Step 5 - Get sites
        getSites(nctIds);
        // Step 6 - Update info table
    }

    private Set<String> getMeshTerms() throws Exception {
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery("select mesh_term from mesh_terms where qualifier='C04'");

        Set<String> meshTerms = new HashSet<>();
        while (resultSet.next()) {
            String meshTerm = resultSet.getString("MESH_TERM");
            if (StringUtil.isNotEmpty(meshTerm)) {
                meshTerms.add(meshTerm);
            }
        }
        resultSet.close();
        stm.close();
        return meshTerms;
    }

    private Set<String> getNctIdsByMeshTerms(Set<String> meshTerms) throws Exception {
        Statement stm = getAactConnection().createStatement();

        meshTerms = new HashSet<>(wrapSqlStringInClause(new ArrayList<>(meshTerms)));

        String NCT_ID_KEY = "NCT_ID";
        String query = "select distinct " + NCT_ID_KEY + " from browse_conditions where mesh_term in (" + String.join(",", meshTerms) + ")";
        ResultSet resultSet = stm.executeQuery(query);

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            String trialId = resultSet.getString(NCT_ID_KEY);
            if (StringUtil.isNotEmpty(trialId)) {
                trials.add(trialId);
            }
        }
        resultSet.close();
        stm.close();
        return trials;
    }

    private Set<String> getTrials(Set<String> nctIds) throws Exception {
        Statement stm = getAactConnection().createStatement();
        String NCT_ID_KEY = "NCT_ID";
        String BRIEF_TITLE_KEY = "BRIEF_TITLE";
        String OVERALL_STATUS_KEY = "OVERALL_STATUS";
        String PHASE_KEY = "PHASE";
        String UPDATED_AT_KEY = "UPDATED_AT";

        String OVERALL_STATUS_RECRUITING_FILTER = "Recruiting";
        String STUDY_TYPE_FILTER = "Interventional";

        String[] keys = new String[]{NCT_ID_KEY, BRIEF_TITLE_KEY, OVERALL_STATUS_KEY, PHASE_KEY, UPDATED_AT_KEY};
        ResultSet resultSet = stm.executeQuery(
            "select " +
                String.join(",", keys) +
                " from studies where" +
                " overall_status = '" + OVERALL_STATUS_RECRUITING_FILTER + "'" +
                " and study_type = '" + STUDY_TYPE_FILTER + "'" +
                " and nct_id in (" + String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds))) + ")"

        );

        Set<String> trialIds = new HashSet<>();
        while (resultSet.next()) {
            Optional<String> trialIdOptional = Optional.ofNullable(resultSet.getString(NCT_ID_KEY));
            String briefTitle = Optional.ofNullable(resultSet.getString(BRIEF_TITLE_KEY)).orElse("");
            String phase = Optional.ofNullable(resultSet.getString(PHASE_KEY)).orElse("");
            String overallStatus = Optional.ofNullable(resultSet.getString(OVERALL_STATUS_KEY)).orElse("");
            Optional<Date> lastUpdateOptional = Optional.ofNullable(resultSet.getDate(UPDATED_AT_KEY));

            if (trialIdOptional.isPresent()) {
                Optional<ClinicalTrial> clinicalTrialOptional = clinicalTrialService.findOneByNctId(trialIdOptional.get());
                if (clinicalTrialOptional.isEmpty()) {
                    ClinicalTrial clinicalTrial = new ClinicalTrial();
                    clinicalTrial.setNctId(trialIdOptional.get());
                    clinicalTrial.setBriefTitle(briefTitle);
                    clinicalTrial.setPhase(phase);
                    clinicalTrial.setStatus(overallStatus);
                    if (lastUpdateOptional.isPresent()) {
                        clinicalTrial.setLastUpdated(Instant.ofEpochMilli(lastUpdateOptional.get().getTime()));
                    }
                    clinicalTrialService.save(clinicalTrial);
                } else {
                    ClinicalTrial clinicalTrial = clinicalTrialOptional.get();
                    clinicalTrial.setBriefTitle(briefTitle);
                    clinicalTrial.setPhase(phase);
                    clinicalTrial.setStatus(overallStatus);
                    if (lastUpdateOptional.isPresent()) {
                        clinicalTrial.setLastUpdated(Instant.ofEpochMilli(lastUpdateOptional.get().getTime()));
                    }
                    clinicalTrialService.partialUpdate(clinicalTrial);
                }
                trialIds.add(trialIdOptional.get());
            }
        }
        resultSet.close();
        stm.close();
        return trialIds;
    }

    private String getCoordinatesString(Double lat, Double lon) {
        return lat + "," + lon;
    }

    private void getSites(Set<String> nctIds) throws Exception {
        // Back fill sites info if the coordinates is empty. The data may have been updated in the database so that the coordinates can be filled after querying the Google Map
        updateCityLevelSitesWithEmptyCoordinates();

        // Include new city level sites
        saveCityLevelSites(nctIds);

        // Include new AACT sites
        saveAllAactSites(nctIds);
    }

    private void saveCityLevelSites(Set<String> nctIds) throws Exception {
        String nctIdList = String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds)));
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery(
            "select distinct city, state, country\n" +
                "        from facilities\n" +
                "        where nct_id in (" +
                nctIdList +
                ")"
        );

        while (resultSet.next()) {
            String city = Optional.ofNullable(resultSet.getString("city")).orElse("");
            String state = Optional.ofNullable(resultSet.getString("state")).orElse("");
            String country = Optional.ofNullable(resultSet.getString("country")).orElse("");

            Optional<Site> siteOptional = siteService.findOneByAactQuery("", city, state, country);
            if (siteOptional.isEmpty()) {
                Site site = new Site();
                site.setAactQuery(siteService.generateAactQuery("", city, state, country));

                country = cleanUpCountry(country);
                state = cleanUpState(state);
                city = cleanUpCity(city);

                site.setCity(city);
                site.setState(state);
                site.setCountry(country);

                log.info("Querying google map for {}, {}, {}", city, state, country);
                GeocodingResult[] mapResult = queryGoogleMapGeocoding("", city, state, country);
                if (mapResult != null) {
                    site.setGoogleMapResult(new Gson().toJson(mapResult));
                    Optional<GeocodingResult> pickedResult = pickGeocoding(mapResult, country);
                    if (pickedResult.isPresent()) {
                        site.setCoordinates(getCoordinatesString(Optional.ofNullable(pickedResult.get().geometry.location.lat).orElse(null), Optional.ofNullable(pickedResult.get().geometry.location.lng).orElse(null)));
                    }
                }
                siteService.save(site);
            }
        }

//        List<Site> sites = siteService.findAllWithEmptyCoordinates();
//        if (sites.size() > 0) {
//            oncoKbUrlService.sendMailToDev("Sites without coordinates exist", "There are " + sites.size() + " site(s) without coordinates, please update accordingly.");
//        }
        resultSet.close();
        stm.close();
    }

    private String cleanUpCountry(String country) {
        if (StringUtil.isEmpty(country)) {
            return "";
        }
        Map<String, String> map = new HashMap<>();
        map.put("korea, republic of", "South Korea");
        map.put("russian federation", "Russia");

        if (map.containsKey(country.toLowerCase())) {
            return map.get(country.toLowerCase());
        }
        return country;
    }

    private String cleanUpState(String state) {
        if (StringUtil.isEmpty(state)) {
            return "";
        }
        Map<String, String> map = new HashMap<>();
        map.put("other", "");
        map.put("n/a = not applicable", "");

        if (map.containsKey(state.toLowerCase())) {
            return map.get(state.toLowerCase());
        }
        return state;
    }

    private String cleanUpCity(String city) {
        if (StringUtil.isEmpty(city)) {
            return "";
        }
        Map<String, String> map = new HashMap<>();
        map.put("multiple locations", "");

        if (map.containsKey(city.toLowerCase())) {
            return map.get(city.toLowerCase());
        }
        return city;
    }

    private void saveAllAactSites(Set<String> nctIds) throws Exception {
        String nctIdList = String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds)));
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery(
            "select nct_id, name, city, state, country\n" +
                "        from facilities\n" +
                "        where nct_id in (" +
                nctIdList +
                ")"
        );

        Map<String, Set<Site>> nctSites = new HashMap<>();
        while (resultSet.next()) {
            String nctId = Optional.ofNullable(resultSet.getString("nct_id")).orElse("");
            String name = Optional.ofNullable(resultSet.getString("name")).orElse("");
            String city = Optional.ofNullable(resultSet.getString("city")).orElse("");
            String state = Optional.ofNullable(resultSet.getString("state")).orElse("");
            String country = Optional.ofNullable(resultSet.getString("country")).orElse("");

            Optional<Site> citySiteOptional = siteService.findOneByAactQuery("", city, state, country);
            if (citySiteOptional.isEmpty()) {
                log.warn("The site does not have a mapped city level site. The site is name: {}.", name);
            } else {
                Site citySite = citySiteOptional.get();
                Site site = new Site();
                site.setName(name);
                site.setCity(citySite.getCity());
                site.setState(citySite.getState());
                site.setCountry(citySite.getCountry());
                site.setCoordinates(citySite.getCoordinates());
                site.setAactQuery(siteService.generateAactQuery(name, city, state, country));

                siteService.save(site);

                if (!nctSites.containsKey(nctId)) {
                    nctSites.put(nctId, new HashSet<>());
                }
                nctSites.get(nctId).add(site);
            }
        }

        for (Map.Entry<String, Set<Site>> mapEntry : nctSites.entrySet()) {
            Optional<ClinicalTrial> clinicalTrialOptional = clinicalTrialService.findOneByNctId(mapEntry.getKey());
            if (clinicalTrialOptional.isPresent()) {
                clinicalTrialOptional.get().setSites(mapEntry.getValue());
            } else {
                log.error("The NCT ID {} is not available, but at this stage, it really should.", mapEntry.getKey());
            }
        }
        resultSet.close();
        stm.close();
    }

    private void updateCityLevelSitesWithEmptyCoordinates() throws Exception {
        List<Site> siteToBeUpdated = siteService.findAllWithEmptyCoordinatesAndEmptyName();

        for(Site site : siteToBeUpdated) {
            GeocodingResult[] mapResult = queryGoogleMapGeocoding("", site.getCity(), site.getState(), site.getCountry());
            if (mapResult != null) {
                site.setGoogleMapResult(new Gson().toJson(mapResult));
                Optional<GeocodingResult> pickedResult = pickGeocoding(mapResult, site.getCountry());
                if (pickedResult.isPresent()) {
                    site.setCoordinates(getCoordinatesString(Optional.ofNullable(pickedResult.get().geometry.location.lat).orElse(null), Optional.ofNullable(pickedResult.get().geometry.location.lng).orElse(null)));
                }
            }
            siteService.partialUpdate(site);
        }
    }

    private GeocodingResult[] queryGoogleMapGeocoding(String name, String city, String state, String country) throws IOException, InterruptedException, ApiException {
        List<String> queryParams = new ArrayList<>();
        queryParams.add(name);
        queryParams.add(city);
        queryParams.add(state);
        return GeocodingApi
            .newRequest(geoApiContext)
            .address(String.join(",", queryParams.stream().filter(param -> StringUtil.isNotEmpty(param)).collect(Collectors.toList())))
            .components(ComponentFilter.country(country))
            .await();
    }

    private Optional<GeocodingResult> pickGeocoding(GeocodingResult[] result, String country) throws Exception {
        if (StringUtil.isEmpty(country)) {
            throw new Exception("country needs to be specified");
        }
        country = country.toLowerCase();
        List<GeocodingResult> resultWithCoordinates = Arrays.stream(result).filter(item -> item.geometry != null && item.geometry.location != null).collect(Collectors.toList());
        for (GeocodingResult item : resultWithCoordinates) {
            Optional<AddressComponent> countryComponent = Arrays.stream(item.addressComponents).filter(addressComponent -> Arrays.stream(addressComponent.types).anyMatch(addressComponentType -> addressComponentType.equals(AddressComponentType.COUNTRY))).findFirst();
            if (countryComponent.isPresent() && countryComponent.get().longName.equalsIgnoreCase(country)) {
                return Optional.of(item);
            }
        }
        log.warn("Cannot find the geocoding matching the country {}", country);
        return Optional.empty();
    }


    private void buildQuery(List<String> queryParams, String value) {
        if (StringUtil.isNotEmpty(value)) {
            queryParams.add(value.replaceAll("[,\\s]", "+").replaceAll("[\\+]+", "+"));
        }
    }

    private List<String> wrapSqlStringInClause(List<String> strings) {
        return strings
            .stream()
            .map(
                term -> {
                    if (term.contains("'")) {
                        term = term.replace("'", "''");
                    }
                    return "'" + term + "'";
                }
            )
            .collect(Collectors.toList());
    }
}
