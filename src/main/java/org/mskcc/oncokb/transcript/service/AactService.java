package org.mskcc.oncokb.transcript.service;

import java.io.IOException;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import com.google.gson.Gson;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.AddressComponent;
import com.google.maps.model.AddressComponentType;
import com.google.maps.model.GeocodingResult;
import jodd.util.StringUtil;
import org.mskcc.oncokb.transcript.OncokbTranscriptApp;
import org.mskcc.oncokb.transcript.config.ApplicationProperties;
import org.mskcc.oncokb.transcript.config.model.AactConfig;
import org.mskcc.oncokb.transcript.domain.Site;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AactService {

    private static final Logger log = LoggerFactory.getLogger(OncokbTranscriptApp.class);

    ApplicationProperties applicationProperties;
    SiteService siteService;

    final String AACT_URL = "aact-db.ctti-clinicaltrials.org";
    final int AACT_PORT = 5432;
    final String AACT_DB_NAME = "aact";
    final String AACT_CONNECTION_STR = "jdbc:postgresql://" + AACT_URL + ":" + AACT_PORT + "/" + AACT_DB_NAME;

    public AactService(ApplicationProperties applicationProperties, SiteService siteService) throws Exception {
        this.applicationProperties = applicationProperties;
        this.siteService = siteService;
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
        getTrials(nctIds);

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
        Set<String> oneNctId = new HashSet<>();
        Iterator<String> itr = nctIds.stream().iterator();
        for (int i = 0; i < 50; i++) {
            oneNctId.add(itr.next());
        }
        oneNctId.add(nctIds.stream().findFirst().get());
        getSites(oneNctId);
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
        String STUDY_TYPE_KEY = "STUDY_TYPE";
        String BRIEF_TITLE_KEY = "BRIEF_TITLE";
        String OVERALL_STATUS_KEY = "OVERALL_STATUS";
        String LAST_KNOWN_STATUS_KEY = "LAST_KNOWN_STATUS";
        String PHASE_KEY = "PHASE";
        String OVERALL_STATUS_RECRUITING="Recruiting";
        String[] keys = new String[]{NCT_ID_KEY, STUDY_TYPE_KEY, BRIEF_TITLE_KEY, OVERALL_STATUS_KEY, LAST_KNOWN_STATUS_KEY, PHASE_KEY};
        ResultSet resultSet = stm.executeQuery(
            "select " +
                String.join(",", keys) +
                " from studies where overall_status = '" + OVERALL_STATUS_RECRUITING + "' and nct_id in (" +
                String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds))) +
                ")"
        );

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

    private String getCoordinatesString(Double lat, Double lon) {
        return lat + "," + lon;
    }

    private GeocodingResult[] getCoordinates(String address) throws IOException, InterruptedException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
            .apiKey(applicationProperties.getGoogleCloud().getApiKey())
            .build();
        return GeocodingApi.geocode(context, address).await();
    }

    private void getSites(Set<String> nctIds) throws Exception {
        saveCityLevelSites(nctIds);
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

            Optional<Site> siteOptional = siteService.findOneByCityAndStateAndCountryAndNameIsEmpty(city, state, country);
            if (siteOptional.isEmpty()) {
                Site site = new Site();
                site.setCity(city);
                site.setState(state);
                site.setCountry(country);

                GeocodingResult[] mapResult = queryGoogleMapGeocoding("", country, city, state);
                if (mapResult != null) {
                    site.setGoogleMapResult(new Gson().toJson(mapResult));
                    Optional<GeocodingResult> pickedResult = pickGeocoding(mapResult, country);
                    if (pickedResult.isPresent()) {
                        site.setCoordinates(getCoordinatesString(Optional.ofNullable(pickedResult.get().geometry.location.lat).orElse(null), Optional.ofNullable(pickedResult.get().geometry.location.lng).orElse(null)));
                    }
                }
                log.warn(site.toString());
                siteService.save(site);
            }
        }
        resultSet.close();
        stm.close();
    }

    private GeocodingResult[] queryGoogleMapGeocoding(String name, String city, String state, String country) throws IOException, InterruptedException, ApiException {
        List<String> queryParams = new ArrayList<>();
        queryParams.add(name);
        queryParams.add(city);
        queryParams.add(state);
        queryParams.add(country);
        return getCoordinates(String.join(",", queryParams.stream().filter(param -> StringUtil.isNotEmpty(param)).collect(Collectors.toList())));
    }

    private Optional<GeocodingResult> pickGeocoding(GeocodingResult[] result, String country) {
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
