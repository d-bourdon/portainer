import { useQuery } from 'react-query';

import { PublicSettingsViewModel } from '@/portainer/models/settings';

import axios, { parseAxiosError } from '../services/axios';

enum AuthenticationMethod {
  Internal = 1,
  LDAP,
  OAuth,
}
export interface PublicSettingsResponse {
  // URL to a logo that will be displayed on the login page as well as on top of the sidebar. Will use default Portainer logo when value is empty string
  LogoURL: string;
  // Active authentication method for the Portainer instance. Valid values are: 1 for internal, 2 for LDAP, or 3 for oauth
  AuthenticationMethod: AuthenticationMethod;
  // Whether edge compute features are enabled
  EnableEdgeComputeFeatures: boolean;
  // Supported feature flags
  Features: Record<string, boolean>;
  // The URL used for oauth login
  OAuthLoginURI: string;
  // The URL used for oauth logout
  OAuthLogoutURI: string;
  // Whether portainer internal auth view will be hidden
  OAuthHideInternalAuth: boolean;
  // Whether telemetry is enabled
  EnableTelemetry: boolean;
  // The expiry of a Kubeconfig
  KubeconfigExpiry: string;
}

export async function getPublicSettings() {
  try {
    const { data } = await axios.get<PublicSettingsResponse>(
      buildUrl('public')
    );
    return new PublicSettingsViewModel(data);
  } catch (e) {
    throw parseAxiosError(
      e as Error,
      'Unable to retrieve application settings'
    );
  }
}

export function usePublicSettings() {
  return useQuery(['settings', 'public'], () => getPublicSettings());
}

function buildUrl(subResource?: string, action?: string) {
  let url = 'settings';
  if (subResource) {
    url += `/${subResource}`;
  }

  if (action) {
    url += `/${action}`;
  }

  return url;
}
