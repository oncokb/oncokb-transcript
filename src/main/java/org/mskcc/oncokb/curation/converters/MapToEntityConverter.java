package org.mskcc.oncokb.curation.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.convert.TypeDescriptor;
import org.springframework.core.convert.converter.GenericConverter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.stereotype.Component;

@Component
@ReadingConverter
public class MapToEntityConverter implements GenericConverter {

    private static final Logger logger = LoggerFactory.getLogger(MapToEntityConverter.class);

    private static final List<Class<?>> convertibleClasses = Arrays.asList(
        CompanionDiagnosticDevice.class,
        FdaSubmission.class,
        Article.class,
        Drug.class,
        Gene.class,
        Alteration.class
    );

    private final ObjectMapper objectMapper;

    public MapToEntityConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Set<ConvertiblePair> getConvertibleTypes() {
        return convertibleClasses
            .stream()
            .map(targetClass -> {
                return new ConvertiblePair(Map.class, targetClass);
            })
            .collect(Collectors.toSet());
    }

    @Override
    public Object convert(Object source, TypeDescriptor sourceType, TypeDescriptor targetType) {
        try {
            return objectMapper.readValue(objectMapper.writeValueAsString(source), targetType.getType());
        } catch (JsonProcessingException e) {
            logger.error("Cannot convert entity", e);
        }

        return null;
    }
}
