import axios, { parseAxiosError } from '../services/axios';

import {
  AccessControlFormData,
  OwnershipParameters,
  ResourceControlId,
  ResourceControlResponse,
  ResourceControlType,
  ResourceId,
} from './types';
import { ResourceControlViewModel } from './models/ResourceControlViewModel';
import { parseOwnershipParameters } from './utils';

/**
 * Update an existing ResourceControl or create a new one on existing resource without RC
 * @param resourceType Type of ResourceControl
 * @param resourceId ID of involved Resource
 * @param resourceControl Previous ResourceControl (can be undefined)
 * @param formValues View data generated by AccessControlPanel
 */
export function applyResourceControlChange(
  resourceType: ResourceControlType,
  resourceId: ResourceId,
  formValues: AccessControlFormData,
  resourceControl?: ResourceControlViewModel
) {
  const ownershipParameters = parseOwnershipParameters(formValues);
  if (resourceControl) {
    return updateResourceControl(resourceControl.Id, ownershipParameters);
  }
  return createResourceControl(resourceType, resourceId, ownershipParameters);
}

/**
 * Apply a ResourceControl after Resource creation
 * @param accessControlData ResourceControl to apply
 * @param resourceControl ResourceControl to update
 * @param subResourcesIds SubResources managed by the ResourceControl
 */
export function applyResourceControl(
  accessControlData: AccessControlFormData,
  resourceControl: ResourceControlResponse,
  subResourcesIds: (number | string)[] = []
) {
  const ownershipParameters = parseOwnershipParameters(
    accessControlData,
    subResourcesIds
  );
  return updateResourceControl(resourceControl.Id, ownershipParameters);
}

/**
 * Update a ResourceControl
 * @param resourceControlId ID of involved resource
 * @param ownershipParameters
 */
async function updateResourceControl(
  resourceControlId: ResourceControlId,
  ownershipParameters: OwnershipParameters
) {
  try {
    await axios.put(buildUrl(resourceControlId), ownershipParameters);
  } catch (error) {
    throw parseAxiosError(error as Error);
  }
}

/**
 * Create a ResourceControl
 * @param resourceType Type of ResourceControl
 * @param resourceId ID of involved resource
 * @param ownershipParameters Transient type from view data to payload
 */
async function createResourceControl(
  resourceType: ResourceControlType,
  resourceId: ResourceId,
  ownershipParameters: OwnershipParameters
) {
  try {
    await axios.post(buildUrl(), {
      ...ownershipParameters,
      type: resourceType,
      resourceId,
    });
  } catch (error) {
    throw parseAxiosError(error as Error);
  }
}

function buildUrl(id?: ResourceControlId) {
  let url = '/resource_controls';

  if (id) {
    url += `/${id}`;
  }

  return url;
}
