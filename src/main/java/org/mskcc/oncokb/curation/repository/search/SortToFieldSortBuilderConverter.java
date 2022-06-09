package org.mskcc.oncokb.curation.repository.search;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.domain.Sort;

/**
 * Text fields are not available for sorting by default. The recommended way is to use multi-field mapping and a have the keyword field for sorting.
 * The converter will attached the ".keyword" field to the property if it is of type String.
 */

public class SortToFieldSortBuilderConverter<T> implements Converter<Sort, List<FieldSortBuilder>> {

    private Class<T> entityClass;

    public SortToFieldSortBuilderConverter(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    @Override
    public List<FieldSortBuilder> convert(Sort sort) {
        List<FieldSortBuilder> builders = new ArrayList<>();
        sort
            .stream()
            .forEach(order -> {
                try {
                    SortOrder sortOrder = SortOrder.fromString(order.getDirection().name());
                    Boolean isStringField = entityClass.getDeclaredField(order.getProperty()).getType().equals(String.class);
                    String property = isStringField ? order.getProperty() + ".keyword" : order.getProperty();
                    builders.add(new FieldSortBuilder(property).order(sortOrder));
                } catch (NoSuchFieldException e) {}
            });
        return builders;
    }
}
