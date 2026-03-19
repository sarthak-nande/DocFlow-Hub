package com.docflowhub.docflow_hub.dto;

import java.io.Serializable;

public record RequestAuthDto(
		String username, String password) implements Serializable {

}
