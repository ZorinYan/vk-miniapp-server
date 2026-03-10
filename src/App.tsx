/*
import { useState, useEffect, ReactNode } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { Persik, Home } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState<UserInfo | undefined>();
  const [popout, setPopout] = useState<ReactNode | null>(<ScreenSpinner />);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);
      setPopout(null);
    }
    fetchData();
  }, []);

  return (
    <SplitLayout>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home id="home" fetchedUser={fetchedUser} />
          <Persik id="persik" />
        </View>
      </SplitCol>
      {popout}
    </SplitLayout>
  );
};
*/

import { View, AdaptivityProvider, AppRoot } from "@vkontakte/vkui";
import { Home } from "./panels/Home";
import bridge from "@vkontakte/vk-bridge";

bridge.send("VKWebAppInit");

export default function App() {
    return (
        <AdaptivityProvider>
            <AppRoot>
                <View activePanel="home">
                    <Home id="home" />
                </View>
            </AppRoot>
        </AdaptivityProvider>
    );
}
