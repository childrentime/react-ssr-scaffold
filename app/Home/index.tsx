import { inject, observer } from "mobx-react";
import { Component, ReactNode } from "react";
import { appProvider } from "../../core/store/appProvider";
import RootStore from "./store";

/**
 * @appProvider中的store名称要和inject中的相同
 */
@appProvider(
  { store: RootStore },
  {
    title: "首页",
  }
)
@inject("store")
@observer
class Home extends Component<{ store: RootStore }> {
  get store() {
    return this.props.store;
  }

  render(): ReactNode {
    return <div>{this.store?.todos?.[0]?.id}12321</div>;
  }
}

export { Home as default };
