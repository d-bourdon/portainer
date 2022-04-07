import { SidebarMenuItem } from '@/portainer/Sidebar/SidebarMenuItem';
import { Environment, EnvironmentId } from '@/portainer/environments/types';
import {
  Authorized,
  useUser,
  isEnvironmentAdmin,
} from '@/portainer/hooks/useUser';
import { SidebarMenu } from '@/portainer/Sidebar/SidebarMenu';
import { useInfo, useVersion } from '@/docker/services/system.service';

interface Props {
  environmentId: EnvironmentId;

  environment: Environment;
}

export function DockerSidebar({
  environmentId,

  environment,
}: Props) {
  const { user } = useUser();
  const isAdmin = isEnvironmentAdmin(user, environmentId);

  const areStacksVisible =
    isAdmin || environment.SecuritySettings.allowStackManagementForRegularUsers;

  const envInfoQuery = useInfo(
    environmentId,
    (info) => !!info.Swarm?.NodeID && !!info.Swarm?.ControlAvailable
  );

  const envVersionQuery = useVersion(environmentId, (version) =>
    parseFloat(version.ApiVersion)
  );

  const isSwarmManager = envInfoQuery.data;
  const apiVersion = envVersionQuery.data || 0;

  const offlineMode = environment.Status === 2;

  return (
    <>
      <SidebarMenuItem
        path="docker.dashboard"
        pathParams={{ endpointId: environmentId }}
        iconClass="fa-tachometer-alt fa-fw"
        className="sidebar-list"
        data-cy="dockerSidebar-dashboard"
      >
        Dashboard
      </SidebarMenuItem>

      {!offlineMode && (
        <SidebarMenu
          label="App Templates"
          iconClass="fa-rocket fa-fw"
          path="docker.templates"
          pathParams={{ endpointId: environmentId }}
          childrenPaths={[]}
        >
          <SidebarMenuItem
            path="docker.templates.custom"
            pathParams={{ endpointId: environmentId }}
            ident
            data-cy="dockerSidebar-customTemplates"
          >
            Custom Templates
          </SidebarMenuItem>
        </SidebarMenu>
      )}

      {areStacksVisible && (
        <SidebarMenuItem
          path="docker.stacks"
          pathParams={{ endpointId: environmentId }}
          iconClass="fa-th-list fa-fw"
          className="sidebar-list"
          data-cy="dockerSidebar-stacks"
        >
          Stacks
        </SidebarMenuItem>
      )}

      {isSwarmManager && (
        <SidebarMenuItem
          path="docker.services"
          pathParams={{ endpointId: environmentId }}
          iconClass="fa-list-alt fa-fw"
          className="sidebar-list"
          data-cy="dockerSidebar-services"
        >
          Services
        </SidebarMenuItem>
      )}

      <SidebarMenuItem
        path="docker.containers"
        pathParams={{ endpointId: environmentId }}
        iconClass="fa-cubes fa-fw"
        className="sidebar-list"
        data-cy="dockerSidebar-containers"
      >
        Containers
      </SidebarMenuItem>

      <SidebarMenuItem
        path="docker.images"
        pathParams={{ endpointId: environmentId }}
        iconClass="fa-clone fa-fw"
        className="sidebar-list"
        data-cy="dockerSidebar-images"
      >
        Images
      </SidebarMenuItem>

      <SidebarMenuItem
        path="docker.networks"
        pathParams={{ endpointId: environmentId }}
        iconClass="fa-sitemap fa-fw"
        className="sidebar-list"
        data-cy="dockerSidebar-networks"
      >
        Networks
      </SidebarMenuItem>

      <SidebarMenuItem
        path="docker.volumes"
        pathParams={{ endpointId: environmentId }}
        iconClass="fa-hdd fa-fw"
        className="sidebar-list"
        data-cy="dockerSidebar-volumes"
      >
        Volumes
      </SidebarMenuItem>

      {apiVersion >= 1.3 && isSwarmManager && (
        <SidebarMenuItem
          path="docker.configs"
          pathParams={{ endpointId: environmentId }}
          iconClass="fa-file-code fa-fw"
          className="sidebar-list"
          data-cy="dockerSidebar-configs"
        >
          Configs
        </SidebarMenuItem>
      )}

      {apiVersion >= 1.25 && isSwarmManager && (
        <SidebarMenuItem
          path="docker.secrets"
          pathParams={{ endpointId: environmentId }}
          iconClass="fa-user-secret fa-fw"
          className="sidebar-list"
          data-cy="dockerSidebar-secrets"
        >
          Secrets
        </SidebarMenuItem>
      )}

      {!isSwarmManager && isAdmin && !offlineMode && (
        <SidebarMenuItem
          path="docker.events"
          pathParams={{ endpointId: environmentId }}
          iconClass="fa-history fa-fw"
          className="sidebar-list"
          data-cy="dockerSidebar-events"
        >
          Events
        </SidebarMenuItem>
      )}

      {!isSwarmManager && (
        <SidebarMenu
          label="Host"
          iconClass="fa-th fa-fw"
          path="docker.host"
          pathParams={{ endpointId: environmentId }}
          childrenPaths={[
            'docker.registries',
            'docker.registries.access',
            'docker.featuresConfiguration',
          ]}
        >
          <Authorized
            authorizations="PortainerEndpointUpdateSettings"
            adminOnlyCE
          >
            <SidebarMenuItem
              path="docker.featuresConfiguration"
              pathParams={{ endpointId: environmentId }}
              ident
              data-cy="dockerSidebar-setup"
            >
              Setup
            </SidebarMenuItem>
          </Authorized>

          <SidebarMenuItem
            path="docker.registries"
            pathParams={{ endpointId: environmentId }}
            ident
            data-cy="dockerSidebar-registries"
          >
            Registries
          </SidebarMenuItem>
        </SidebarMenu>
      )}

      {isSwarmManager && (
        <SidebarMenu
          label="Swarm"
          iconClass="fa-object-group fa-fw"
          path="docker.swarm"
          pathParams={{ endpointId: environmentId }}
          childrenPaths={[
            'docker.registries',
            'docker.registries.access',
            'docker.featuresConfiguration',
          ]}
        >
          <Authorized
            authorizations="PortainerEndpointUpdateSettings"
            adminOnlyCE
          >
            <SidebarMenuItem
              path="docker.featuresConfiguration"
              pathParams={{ endpointId: environmentId }}
              ident
              data-cy="dockerSidebar-setup"
            >
              Setup
            </SidebarMenuItem>
          </Authorized>

          <SidebarMenuItem
            path="docker.registries"
            pathParams={{ endpointId: environmentId }}
            ident
            data-cy="dockerSidebar-registries"
          >
            Registries
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </>
  );
}
