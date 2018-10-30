import React, { Component } from 'react';
import styled from 'react-emotion';
import { Subscribe } from 'unstated';
import { Redirect } from 'react-router';
import WAL, { WalletProvider, WalletAccessSession } from 'eos-ual';
import { CloseButton } from '../shared/buttons/CloseButton';
import { SessionStateContainer } from '../core/SessionStateContainer';
import { LoginButton } from './LoginButton';
import { LoginScreenWalletList } from './LoginScreenWalletList';

// Visual components

const LoginScreenRoot = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: 100
});

const ContentPanelHeader = styled('div')({
  display: 'flex',
  width: '100%',
  marginBottom: 15
});

interface ContentPanelHeaderItemProps {
  main?: boolean;
  alignEnd?: boolean;
}

const ContentPanelHeaderItem = styled('div')(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  ({ main, alignEnd }: ContentPanelHeaderItemProps) => {
    const style = {};

    if (main) {
      Object.assign(style, { flex: 1 });
    }

    if (alignEnd) {
      Object.assign(style, { justifyContent: 'flex-end' });
    }

    return style;
  }
);

const ContentPanelHeading = styled('span')({
  fontSize: 12,
  textTransform: 'uppercase',
  fontWeight: 300
});

// Exported components

export interface LoginScreenProps {
  sessionStateContainer: SessionStateContainer;
}

export interface LoginScreenState {
  showLoginOptions: boolean;
}

export class LoginScreen extends Component<LoginScreenProps, LoginScreenState> {
  state = {
    showLoginOptions: false
  };

  switchScreen = () => {
    this.setState(state => ({ showLoginOptions: !state.showLoginOptions }));
  };

  handleWalletProviderSelect = (walletProvider: WalletProvider) => {
    WAL.accessContext.initSession(walletProvider);
  };

  handleWalletReconnectClick = (walletSession: WalletAccessSession) => {
    walletSession.connect().then(walletSession.login);
  };

  render() {
    const {
      switchScreen,
      handleWalletProviderSelect,
      handleWalletReconnectClick
    } = this;
    const { sessionStateContainer } = this.props;
    const { showLoginOptions } = this.state;
    const { isLoggedIn } = sessionStateContainer;
    const { getSessions, getWalletProviders } = WAL.accessContext;

    if (isLoggedIn()) return <Redirect to="/" />;

    return (
      <LoginScreenRoot>
        {showLoginOptions ? (
          <>
            <ContentPanelHeader>
              <ContentPanelHeaderItem main={true}>
                <ContentPanelHeading>Login Options</ContentPanelHeading>
              </ContentPanelHeaderItem>
              <ContentPanelHeaderItem alignEnd={true}>
                <CloseButton onClick={switchScreen} size={40} />
              </ContentPanelHeaderItem>
            </ContentPanelHeader>
            <LoginScreenWalletList
              walletProviders={getWalletProviders()}
              walletSessions={getSessions()}
              onWalletProviderSelect={handleWalletProviderSelect}
              onWalletReconnectClick={handleWalletReconnectClick}
            />
          </>
        ) : (
          <LoginButton onClick={switchScreen} />
        )}
      </LoginScreenRoot>
    );
  }
}

export default function LoginScreenConnected() {
  return (
    <Subscribe to={[SessionStateContainer]}>
      {(sessionStateContainer: SessionStateContainer) => (
        <LoginScreen sessionStateContainer={sessionStateContainer} />
      )}
    </Subscribe>
  );
}