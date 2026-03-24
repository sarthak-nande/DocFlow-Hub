package com.docflowhub.docflow_hub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import com.docflowhub.docflow_hub.versioning.VersionedRequestMappingHandlerMapping;

@Configuration
public class WebConfig extends WebMvcConfigurationSupport {

    @Override
    public RequestMappingHandlerMapping createRequestMappingHandlerMapping() {
        return new VersionedRequestMappingHandlerMapping();
    }
}
