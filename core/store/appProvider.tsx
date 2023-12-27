import hoistNonReactStatics from "hoist-non-react-statics";
import {
  enableStaticRendering,
  observer,
  PropTypes as MobxPropTypes,
  Provider,
} from "mobx-react";
import { Component, ComponentClass, ReactNode } from "react";
import { AppServerContext } from "../requestContext/server";
import PropTypes from "prop-types";

export interface AppConfig {
  title: string;
}

export interface AppProps {
  stores: any[];
}

export interface AppComponentClass extends ComponentClass {
  appConfig: AppConfig;
  createStores: () => Record<string, any>;
  stores: Record<string, any>;
}

export interface AppComponent {
  Component: AppComponentClass;
  getInitialProps: (context?: AppServerContext) => Promise<{
    stores: Record<string, any>;
  }>;
}

const appProvider = (Stores: Record<string, any>, appConfig: AppConfig) => {
  return (AppComponent: ComponentClass<{ store: any }>) => {
    class App extends Component<AppProps> {
      static appConfig = {
        ...appConfig,
      };

      static createStores() {
        return Object.keys(Stores).reduce((result, key) => {
          result[key] = new Stores[key]();
          return result;
        }, {} as Record<string, any>);
      }

      static propTypes = {
        stores: PropTypes.arrayOf(MobxPropTypes.observableObject),
      };

      async componentDidMount() {
        const isClientRender = this.props.stores.some(
          (store) => !store.isServerRendered
        );

        if (!isClientRender) {
          this.props.stores.forEach((store) => store.prepareClientData());
        }
        this.props.stores.forEach((store) => store.finishInitLoading());
      }

      render(): ReactNode {
        return this.props.stores.every((store) => store.isFinishInitLoading) ? (
          // @ts-expect-error
          <AppComponent />
        ) : null;
      }
    }

    return observer(App) as any;
  };
};

// 根组件store注入 必须在client端和server端保持一致
const createInitialPropsFun = (Component: AppComponentClass) => {
  return async (context?: AppServerContext) => {
    // @ts-ignore
    const stores = (Component.stores || Component.createStores()) as Record<
      string,
      any
    >;

    await Promise.all(
      Object.values(stores).map((store) =>
        process.env.BROWSER
          ? store.initClientData()
          : store.initServerData(context)
      )
    );
    return { stores };
  };
};

const createPage = (Component: any): AppComponent => {
  !process.env.BROWSER && enableStaticRendering(true);

  const App = ({ stores = {}, ...otherProps }: any) => {
    return (
      <Provider {...stores}>
        <Component stores={Object.values(stores)} {...otherProps} />
      </Provider>
    );
  };

  hoistNonReactStatics(App, Component);

  return {
    Component: App as unknown as AppComponentClass,
    getInitialProps: createInitialPropsFun(Component as AppComponentClass),
  };
};

export { appProvider, createPage };
