package com.docflowhub.docflow_hub.versioning;

import java.lang.annotation.*;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiVersion {
    int value() default 1; // Default to version 1
}
