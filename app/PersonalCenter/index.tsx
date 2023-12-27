import { observer } from "mobx-react";
import { Component, ReactNode } from "react";
import { appProvider } from "../../core/store/appProvider";

@appProvider(
  { store: Store },
  {
    title: "首页",
  }
)
@observer
class PersonalCenter extends Component {
  render(): ReactNode {
    return <div>首页</div>;
  }
}

export { PersonalCenter as default };
