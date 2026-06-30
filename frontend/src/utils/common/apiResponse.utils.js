export function getResponseEntity(response, entityName) {
  if (!response) {
    return null;
  }

  if (response.id) {
    return response;
  }

  if (response.data && response.data.id) {
    return response.data;
  }

  if (response.data && response.data[entityName]) {
    return response.data[entityName];
  }

  if (response[entityName]) {
    return response[entityName];
  }

  return null;
}

export function getEntityId(response, entityName) {
  const entity = getResponseEntity(response, entityName);

  if (entity && entity.id) {
    return entity.id;
  }

  return null;
}

export function getListFromResponse(response, listName) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response[listName])) {
    return response[listName];
  }

  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && response.data && Array.isArray(response.data[listName])) {
    return response.data[listName];
  }

  return [];
}

export function getErrorMessage(error, fallback) {
  if (error && error.message) {
    return error.message;
  }

  if (error && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors.join(" ");
  }

  if (error && error.error) {
    return error.error;
  }

  return fallback;
}
