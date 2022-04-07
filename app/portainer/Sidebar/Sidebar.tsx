import { r2a } from '@/react-tools/react2angular';
import { Environment } from '@/portainer/environments/types';
import { useUser } from '@/portainer/hooks/useUser';
import { useIsTeamLeader } from '@/portainer/users/queries';
import { usePublicSettings } from '@/portainer/settings/settings.service';

import styles from './Sidebar.module.css';
import { EdgeSidebar } from './EdgeSidebar';
import { EnvironmentSidebar } from './EnvironmentSidebar';
import { SettingsSidebar } from './SettingsSidebar';
import { SidebarMenuItem } from './SidebarMenuItem';
import { Footer } from './Footer';
import { Header } from './Header';
import { SidebarProvider } from './useSidebarState';

interface Props {
  environment: Environment;
}

export function Sidebar({ environment }: Props) {
  const { isAdmin, user } = useUser();
  const isTeamLeader = useIsTeamLeader(user);

  const settingsQuery = usePublicSettings();

  if (!settingsQuery.data) {
    return null;
  }

  const { EnableEdgeComputeFeatures, LogoURL } = settingsQuery.data;

  return (
    /* in the future (when we remove r2a) this should wrap the whole app - to change root styles */
    <SidebarProvider>
      <div id="sidebar-wrapper" className={styles.root}>
        <Header logo={LogoURL} />
        <div className={styles.sidebarContent}>
          <ul className={styles.sidebar}>
            <SidebarMenuItem
              path="portainer.home"
              iconClass="fa-home fa-fw"
              className="sidebar-list"
              data-cy="portainerSidebar-home"
            >
              Home
            </SidebarMenuItem>

            {environment && <EnvironmentSidebar environment={environment} />}

            {isAdmin && EnableEdgeComputeFeatures && <EdgeSidebar />}

            {(isAdmin || isTeamLeader) && <SettingsSidebar isAdmin={isAdmin} />}
          </ul>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
}

export const SidebarAngular = r2a(Sidebar, ['environment']);
