package com.docflowhub.docflow_hub.versioning;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import java.lang.reflect.Method;

public class VersionedRequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    @Override
    protected RequestMappingInfo getMappingForMethod(Method method, Class<?> handlerType) {
        RequestMappingInfo info = super.getMappingForMethod(method, handlerType);
        if (info != null) {
       
            ApiVersion apiVersion = AnnotationUtils.findAnnotation(handlerType, ApiVersion.class);
            if (apiVersion == null) {
                apiVersion = AnnotationUtils.findAnnotation(method, ApiVersion.class);
            }

            if (apiVersion != null) {
                
                String prefix = "/api/v" + apiVersion.value();
                RequestMappingInfo prefixInfo = RequestMappingInfo.paths(prefix).build();
                return prefixInfo.combine(info);
            }
        }
        return info;
    }
}